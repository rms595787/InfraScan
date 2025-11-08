import cv2
import numpy as np
import matplotlib.pyplot as plt
from skimage.metrics import structural_similarity as ssim
from tkinter import Tk
from tkinter.filedialog import askopenfilename

def compare_images(image1, image2, min_area=1):
    gray1 = cv2.cvtColor(image1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(image2, cv2.COLOR_BGR2GRAY)
    ssim_score, diff = ssim(gray1, gray2, full=True, win_size=7)
    diff = (diff * 255).astype("uint8")
    _, thresh = cv2.threshold(diff, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    image_diff_boxes = image2.copy()
    diff_highlighted = np.zeros_like(image1)

    for contour in contours:
        if cv2.contourArea(contour) > min_area:
            x, y, w, h = cv2.boundingRect(contour)
            cv2.rectangle(image_diff_boxes, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.drawContours(diff_highlighted, [contour], -1, (255, 255, 255), thickness=cv2.FILLED)

    diff_highlighted = cv2.bitwise_not(diff_highlighted)
    return image_diff_boxes, diff_highlighted, ssim_score

def show_images(image1, image2, diff_image_boxes, diff_image_highlighted, ssim_score):
    similarity_percentage = ssim_score * 100
    difference_percentage = 100 - similarity_percentage

    plt.figure(figsize=(16, 12))
    plt.subplot(2, 2, 1)
    plt.imshow(cv2.cvtColor(image1, cv2.COLOR_BGR2RGB))
    plt.title("Previous Image")
    plt.axis('off')

    plt.subplot(2, 2, 2)
    plt.imshow(cv2.cvtColor(image2, cv2.COLOR_BGR2RGB))
    plt.title("Current Image")
    plt.axis('off')

    plt.subplot(2, 2, 3)
    plt.imshow(cv2.cvtColor(diff_image_boxes, cv2.COLOR_BGR2RGB))
    plt.title("Differences with Boxes")
    plt.axis('off')

    plt.subplot(2, 2, 4)
    plt.imshow(cv2.cvtColor(diff_image_highlighted, cv2.COLOR_BGR2RGB))
    plt.title("Differences Highlighted With Black Color")
    plt.axis('off')

    plt.subplots_adjust(left=0.02, right=0.98, top=0.95, bottom=0.05)
    plt.figtext(0.5, 0.01, f"SSIM Score: {ssim_score:.2f} | Similarity: {similarity_percentage:.2f}% | Difference: {difference_percentage:.2f}%", ha="center", fontsize=12)
    plt.show()

def resize_images_to_common_size(image1, image2):
    height1, width1 = image1.shape[:2]
    height2, width2 = image2.shape[:2]
    target_height, target_width = max(height1, height2), max(width1, width2)
    resized_image1 = cv2.resize(image1, (target_width, target_height))
    resized_image2 = cv2.resize(image2, (target_width, target_height))
    return resized_image1, resized_image2

# --- File selection dialog ---
Tk().withdraw()  # Hide the root window
image_path1 = askopenfilename(title="Select Previous Image")
image_path2 = askopenfilename(title="Select Current Image")

# Load images
image1 = cv2.imread(image_path1)
image2 = cv2.imread(image_path2)

if image1 is None or image2 is None:
    print("One or both images could not be loaded. Please check the files.")
else:
    resized_image1, resized_image2 = resize_images_to_common_size(image1, image2)
    diff_image_boxes, diff_image_highlighted, ssim_score = compare_images(resized_image1, resized_image2)
    show_images(resized_image1, resized_image2, diff_image_boxes, diff_image_highlighted, ssim_score)
