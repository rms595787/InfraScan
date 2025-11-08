import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim
from skimage.exposure import match_histograms
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid


# --- Initialize Flask App ---
app = Flask(__name__, static_folder='static')
CORS(app)  # Allow frontend (React) to access backend


# -----------------------------
# 1️⃣ ORB-based Alignment
# -----------------------------
def align_images_orb(img1, img2, max_features=500, keep_percent=0.9):
    """Estimate homography using ORB features and warp img1 to align with img2."""
    gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

    orb = cv2.ORB_create(max_features)
    k1, d1 = orb.detectAndCompute(gray1, None)
    k2, d2 = orb.detectAndCompute(gray2, None)

    if d1 is None or d2 is None:
        return img1  # cannot align

    matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = matcher.match(d1, d2)
    if len(matches) < 10:
        return img1  # not enough matches

    matches = sorted(matches, key=lambda x: x.distance)
    keep = int(len(matches) * keep_percent)
    matches = matches[:max(keep, 10)]

    ptsA = np.float32([k1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
    ptsB = np.float32([k2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)

    H, mask = cv2.findHomography(ptsA, ptsB, cv2.RANSAC, 5.0)
    if H is None:
        return img1

    warped = cv2.warpPerspective(img1, H, (img2.shape[1], img2.shape[0]), flags=cv2.INTER_LINEAR)
    return warped


# -----------------------------
# 2️⃣ Morphological Cleanup
# -----------------------------
def clean_mask(binary_mask, min_area=200, kernel_size=3):
    """Remove noise and small components from binary mask."""
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
    cleaned = cv2.morphologyEx(binary_mask, cv2.MORPH_OPEN, kernel, iterations=1)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel, iterations=1)

    nb_components, output, stats, _ = cv2.connectedComponentsWithStats(cleaned, connectivity=8)
    sizes = stats[1:, cv2.CC_STAT_AREA]

    cleaned2 = np.zeros(output.shape, dtype=np.uint8)
    for i, size in enumerate(sizes):
        if size >= min_area:
            cleaned2[output == i + 1] = 255
    return cleaned2


# -----------------------------
# 3️⃣ Core Image Comparison
# -----------------------------
def compare_images(img1, img2, min_area=200, align=True):
    # Convert to grayscale
    gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

    if align:
        # Feature-based alignment (ORB)
        orb = cv2.ORB_create(5000)
        kp1, des1 = orb.detectAndCompute(gray1, None)
        kp2, des2 = orb.detectAndCompute(gray2, None)
        if des1 is not None and des2 is not None and len(kp1) > 10 and len(kp2) > 10:
            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            matches = bf.match(des1, des2)
            matches = sorted(matches, key=lambda x: x.distance)
            if len(matches) > 10:
                src_pts = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
                dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)
                M, _ = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
                if M is not None:
                    h, w = gray1.shape
                    gray1 = cv2.warpPerspective(gray1, M, (w, h))

    # ✅ Ensure both grayscale images have same dimensions before SSIM
    if gray1.shape != gray2.shape:
        gray2 = cv2.resize(gray2, (gray1.shape[1], gray1.shape[0]))

    # Structural similarity index (SSIM)
    ssim_score, diff = ssim(gray1, gray2, full=True)
    diff = (diff * 255).astype("uint8")

    # Absolute difference for intensity-based detection
    absdiff = cv2.absdiff(gray1, gray2)

    # ✅ Ensure same dtype before combining
    if absdiff.dtype != diff.dtype:
        diff = diff.astype(absdiff.dtype)

    combined = cv2.addWeighted(absdiff, 0.6, diff, 0.4, 0)

    # Threshold
    _, thresh = cv2.threshold(combined, 30, 255, cv2.THRESH_BINARY)

    # Morphological closing
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    output = img2.copy()
    for cnt in contours:
        if cv2.contourArea(cnt) > min_area:
            x, y, w, h = cv2.boundingRect(cnt)
            cv2.rectangle(output, (x, y), (x + w, y + h), (0, 0, 255), 2)

    return output, mask, ssim_score

# -----------------------------
# 4️⃣ Flask Endpoint for Analysis
# -----------------------------
@app.route('/analyze', methods=['POST'])
def analyze_images():
    print("--- Received new request on /analyze ---")

    if 'past_image' not in request.files or 'current_image' not in request.files:
        return jsonify({'error': 'Missing image files'}), 400

    past_image_file = request.files['past_image']
    current_image_file = request.files['current_image']

    past_image = cv2.imdecode(np.frombuffer(past_image_file.read(), np.uint8), cv2.IMREAD_COLOR)
    current_image = cv2.imdecode(np.frombuffer(current_image_file.read(), np.uint8), cv2.IMREAD_COLOR)

    if past_image is None or current_image is None:
        return jsonify({'error': 'Could not read one or both image files'}), 400

    print("✅ Successfully decoded both images")

    boxes_img, mask_img, ssim_score = compare_images(past_image, current_image, min_area=200, align=True)
    print("🔍 Image comparison complete")

    # Save results
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_folder = os.path.join(script_dir, 'static', 'results')
    os.makedirs(output_folder, exist_ok=True)

    unique_id = str(uuid.uuid4())
    boxes_filename = f"{unique_id}_boxes.png"
    mask_filename = f"{unique_id}_mask.png"

    boxes_filepath = os.path.join(output_folder, boxes_filename)
    mask_filepath = os.path.join(output_folder, mask_filename)

    cv2.imwrite(boxes_filepath, boxes_img)
    cv2.imwrite(mask_filepath, mask_img)

    print(f"💾 Saved results to {output_folder}")

    # More accurate difference percentage based on change mask
    total_pixels = mask_img.shape[0] * mask_img.shape[1]
    changed_pixels = cv2.countNonZero(mask_img)
    difference_percentage = (changed_pixels / total_pixels) * 100
    
    # Also round both values for cleaner display
    ssim_score = round(ssim_score, 4)
    difference_percentage = round(difference_percentage, 2)

    response_data = {
        "resultImage1Url": f"http://127.0.0.1:5001/static/results/{boxes_filename}",
        "resultImage2Url": f"http://127.0.0.1:5001/static/results/{mask_filename}",
        "textInfo": {"ssim": ssim_score, "difference": difference_percentage}
    }

    print("--- ✅ Sending successful response ---")
    return jsonify(response_data)


# -----------------------------
# 5️⃣ Run Server
# -----------------------------
if __name__ == '__main__':
    app.run(debug=True, port=5001)
