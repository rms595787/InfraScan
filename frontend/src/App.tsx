// src/App.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { Home, PlayCircle, FileText } from "lucide-react";
import axios from "axios";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUpload } from "@/components/ui/file-upload";
import { useScroll, useTransform } from "framer-motion"; // Add these new hooks to your framer-motion import
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect"; // Import the new component

// --- Type Definitions ---
interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  handleScroll: (href: string) => void;
}

interface AnalysisResult {
  resultImage1Url: string;
  resultImage2Url: string;
  textInfo: { ssim: number; difference: number };
}

// --- Main App Component ---
export default function App() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Disable this effect on mobile screens
      if (window.innerWidth < 768) {
        return;
      }
      // If mouse is within 20px of the left edge, open the sidebar
      if (event.clientX < 20) {
        setOpen(true);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [setOpen]); // The empty array ensures this runs only once
  const navLinks: NavLink[] = [
    { label: "Home", href: "#home", icon: <Home className="h-5 w-5" /> },
    {
      label: "InfraScan Test",
      href: "#demo",
      icon: <PlayCircle className="h-5 w-5" />,
    },
    {
      label: "Research Paper",
      href: "#research",
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  const handleScroll = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false); // Close sidebar on link click
  };

  return (
    <>
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        navLinks={navLinks}
        handleScroll={handleScroll}
      />

      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm shadow-md"
      >
        <IconMenu2 className="h-5 w-5 text-black dark:text-white" />
      </button>

      <HomePageSection handleScroll={handleScroll} />
      <DemoPageSection />
      <ResearchPageSection />
      <Footer />
    </>
  );
}

// --- NEW Sidebar Component (defined locally) ---
function Sidebar({ open, onClose, navLinks, handleScroll }: SidebarProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 h-full w-72 bg-neutral-900 text-white p-6 z-50 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">InfraScan</h2>
              <button onClick={onClose}>
                <IconX className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScroll(link.href);
                  }}
                  className="flex items-center p-3 rounded-lg text-neutral-200 hover:bg-neutral-800 cursor-pointer transition-colors"
                >
                  {link.icon}
                  <span className="ml-4 text-lg">{link.label}</span>
                </a>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// --- Home Page Section ---
function HomePageSection({
  handleScroll,
}: {
  handleScroll: (href: string) => void;
}) {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 1.2]);

  return (
    <section
      id="home"
      ref={ref}
      className="h-[200vh] bg-black w-full dark:border dark:border-white/[0.1] rounded-md relative z-10"
    >
      <div className="container mx-auto px-4 sticky top-0 h-screen">
        <GoogleGeminiEffect
          title="InfraScan Automated Urban Monitoring"
          description="Using satellite imagery and machine learning to detect unauthorized constructions with high accuracy."
          pathLengths={[
            pathLengthFirst,
            pathLengthSecond,
            pathLengthThird,
            pathLengthFourth,
            pathLengthFifth,
          ]}
          onButtonClick={() => handleScroll("#demo")}
        />
      </div>
    </section>
  );
}

// --- Demo Page Section ---
function DemoPageSection() {
  // uploaded images
  const [pastImage, setPastImage] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<File | null>(null);

  // preview of uploaded images
  const [pastImageUrl, setPastImageUrl] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const [showUploads, setShowUploads] = useState(false);

  // Image: This object holds the URLs for both result images.
  // Purpose: This state stores all the information received from your Python backend after a successful analysis. The actual image URLs are inside this object:
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!pastImage || !currentImage) return;
    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("past_image", pastImage);
    formData.append("current_image", currentImage);

    try {
      // This URL points to your Python server
      const response = await axios.post<AnalysisResult>(
        "http://127.0.0.1:5001/analyze",
        formData
      );
      setResult(response.data);
      setShowUploads(true);
    } catch (error) {
      console.error("Error analyzing images:", error);
      alert(
        "An error occurred during analysis. Make sure the Python server is running."
      );
    } finally {
      setIsLoading(false);
    }
    setIsLoading(false);
  };
  // const handlePastImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setPastImage(file);
  //     setPastImageUrl(URL.createObjectURL(file));
  //   }
  // };

  // const handleCurrentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setCurrentImage(file);
  //     setCurrentImageUrl(URL.createObjectURL(file));
  //   }
  // };
  return (
    <section>
      <div className="bg-black w-[100%] h-[80vh]"></div>
      <Card id="demo" className="m-[4rem]">
        <section className="py-20 bg-background relative ">
          <div className="container mx-auto px-4">
            <CardTitle className="text-lg md:text-6xl font-normal text-center pb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-400 to-neutral-900">
              InfraScan Test
            </CardTitle>
            <Card className="max-w-3xl mx-auto shadow-lg">
              <CardHeader>
                <CardDescription className="text-lg md:text-2xl font-normal text-center pb-4 bg-clip-text  bg-gradient-to-b from-neutral-400 to-neutral-900">
                  Upload Image
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center">
                    <Label
                      htmlFor="past-image"
                      className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base"
                    >
                      Past Image
                    </Label>
                    <FileUpload
                      onChange={(file) => {
                        if (file && file.length > 0) {
                          setPastImage(file[0]);
                          setPastImageUrl(URL.createObjectURL(file[0]));
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <Label
                      htmlFor="current-image"
                      className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base"
                    >
                      Current Image
                    </Label>
                    <FileUpload
                      onChange={(files) => {
                        if (files && files.length > 0) {
                          const file = files[0];
                          setCurrentImage(file);
                          setCurrentImageUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="shadow-md border-2 border-black text-black px-4 py-2 rounded-lg text-lg md:text-xl font-normal text-center transition-all duration-300 hover:text-transparent hover:border-transparent hover:bg-clip-text hover:bg-gradient-to-b hover:from-neutral-400 hover:to-neutral-900"
                  >
                    {isLoading ? "Analyzing..." : "Analyze for Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            {isLoading && (
              <div className="mt-8 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-[250px] w-full rounded-lg" />
                <Skeleton className="h-[250px] w-full rounded-lg" />
              </div>
            )}

            {result && (
              <div className="mt-8 max-w-3xl mx-auto space-y-12">
                {/* Section for Uploaded Images */}
                {showUploads && (
                  <div>
                    <h3 className="text-3xl font-bold text-center">
                      Your Uploads
                    </h3>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="flex gap-14 justify-center"
                    >
                      <CardContainer>
                        <CardBody className="border border-gray-300 rounded-2xl p-6 shadow-md flex-shrink-0 w-[35vw] min-w-[500px]">
                          <div>
                            <CardItem translateZ="80" className="w-full">
                              <h4 className="text-xl font-bold text-neutral-600 dark:text-white">
                                Past Image
                              </h4>
                            </CardItem>
                            <CardItem
                              as="p"
                              translateZ="80"
                              className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                            >
                              Previous infrastructure layout before recent
                              changes
                            </CardItem>
                            <CardItem translateZ="80" className="w-full">
                              <img
                                src={pastImageUrl!}
                                alt="Past Upload"
                                className="rounded-lg border"
                              />
                            </CardItem>
                          </div>
                        </CardBody>
                      </CardContainer>
                      <CardContainer>
                        <CardBody className="border border-gray-300 rounded-2xl p-6 shadow-md flex-shrink-0 w-[35vw] min-w-[500px]">
                          <div>
                            <CardItem translateZ="80" className="w-full">
                              <h4 className="text-xl font-bold text-neutral-600 dark:text-white">
                                Current Image
                              </h4>
                            </CardItem>
                            <CardItem
                              as="p"
                              translateZ="80"
                              className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                            >
                              Updated urban layout highlighting recent
                              developments
                            </CardItem>
                            <CardItem translateZ="80" className="w-full">
                              <img
                                src={currentImageUrl!}
                                alt="Current Upload"
                                className="rounded-lg border"
                              />
                            </CardItem>
                          </div>
                        </CardBody>
                      </CardContainer>
                    </motion.div>
                  </div>
                )}

                {/* Section for Result Images */}
                <div>
                  <h3 className="text-2xl font-bold text-center">
                    Analysis Results
                  </h3>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex gap-14 justify-center"
                  >
                    <CardContainer>
                      <CardBody className="border border-gray-300 rounded-2xl p-6 shadow-md flex-shrink-0 w-[35vw] min-w-[500px]">
                        <div>
                          <CardItem translateZ="80" className="w-full">
                            <h4 className="text-xl font-bold text-neutral-600 dark:text-white">
                              Result: Detections
                            </h4>
                          </CardItem>
                          <CardItem
                            as="p"
                            translateZ="80"
                            className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                          >
                            New constructions automatically detected and
                            highlighted
                          </CardItem>
                          <CardItem translateZ="80" className="w-full">
                            <img
                              src={result.resultImage1Url}
                              alt="Detections"
                              className="rounded-lg border"
                            />
                          </CardItem>
                        </div>
                      </CardBody>
                    </CardContainer>
                    <CardContainer>
                      <CardBody className="border border-gray-300 rounded-2xl p-6 shadow-md flex-shrink-0 w-[35vw] min-w-[500px]">
                        <div>
                          <CardItem translateZ="80" className="w-full">
                            <h4 className="text-xl font-bold text-neutral-600 dark:text-white">
                              Result: Difference Mask
                            </h4>
                          </CardItem>
                          <CardItem
                            as="p"
                            translateZ="80"
                            className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                          >
                            Visual difference mask showing changes over time
                          </CardItem>
                          <CardItem translateZ="80" className="w-full">
                            <img
                              src={result.resultImage2Url}
                              alt="Difference Mask"
                              className="rounded-lg border"
                            />
                          </CardItem>
                        </div>
                      </CardBody>
                    </CardContainer>
                  </motion.div>

                  <div className="flex justify-center mt-8 ">
                    <Card className="w-[35vw] min-w-[500px] shadow-lg">
                      <CardHeader className="flex justify-center">
                        <CardTitle>Test Information</CardTitle>
                      </CardHeader>
                      <CardContent className="flex justify-center gap-x-8">
                        <p>
                          <strong>SSIM Score:</strong>{" "}
                          {result.textInfo.ssim.toFixed(4)}
                        </p>
                        <p>
                          <strong>Difference:</strong>{" "}
                          {result.textInfo.difference.toFixed(2)}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </Card>
    </section>
  );
}

// --- Research Page Section ---
function ResearchPageSection() {
  return (
    <Card id="research" className="m-[4rem]">
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg md:text-6xl font-normal text-center pb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-400 to-neutral-900">
              Research Paper
            </h2>
            <h2 className="text-2xl font-bold mb-2">
              Detection of Unauthorized Construction using Machine Learning: A
              Review
            </h2>
            <p className="text-muted-foreground mb-6">
              This paper reviews 14 research papers from 2015-2024 on detecting
              unauthorized construction using ML and satellite imagery.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>DOI</CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href="https://doi.org/10.63169/GCARED2025.p30"
                    target="_blank"
                    className="text-blue-500 hover:underline"
                  >
                    10.63169/GCARED2025.p30
                  </a>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>ISBN</CardTitle>
                </CardHeader>
                <CardContent>978-93-343-1044-3</CardContent>
              </Card>
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>SSRN</CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href="https://ssrn.com/abstract=5357895"
                    target="_blank"
                    className="text-blue-500 hover:underline"
                  >
                    ssrn.com/abstract=5357895
                  </a>
                </CardContent>
              </Card>
            </div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>View Paper Abstract</CardTitle>
              </CardHeader>
              <CardContent>
                <iframe
                  src="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5357895"
                  className="w-full h-[600px] border rounded-md"
                ></iframe>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Card>
  );
}

// --- Footer Component ---
function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <p>Email: info@infrascan.com</p>
            <p>Phone: +1 234 567 890</p>
            <p>Address: 123 Urban Street, City, Country</p>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Follow Us</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-blue-400 hover:underline"
                  target="_blank"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-pink-500 hover:underline"
                  target="_blank"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          {/* Other Info / Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:underline">
                  InfraScan Test
                </a>
              </li>
              <li>
                <a href="#research" className="hover:underline">
                  Research Paper
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-neutral-400">
          &copy; {new Date().getFullYear()} InfraScan. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
