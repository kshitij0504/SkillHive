import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ChevronRight,
  Users,
  BookOpen,
  Award,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import {
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaGithub,
} from "react-icons/fa";
import teamAnimation from "../../components/hero.json";
import LoadingScreen from "../../components/LoadingScreen";
import Lottie from "lottie-react";
import { Link } from "react-router-dom";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    // Handle scroll for navbar effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {isLoading && <LoadingScreen />}

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md py-2" : "bg-white py-4"
        }`}
      >
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-blue-600 font-bold text-2xl">
                Skill<span className="text-amber-500">Hive</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-800 hover:text-blue-600 transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-800 hover:text-blue-600 transition-colors font-medium"
              >
                How It Works
              </a>
              <a
                href="#about"
                className="text-gray-800 hover:text-blue-600 transition-colors font-medium"
              >
                About Us
              </a>
              <a
                href="#contact"
                className="text-gray-800 hover:text-blue-600 transition-colors font-medium"
              >
                Contact
              </a>
              <div className="flex space-x-4 ml-4">
                <Link to="/login">
                  <button className="px-5 py-2 text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors font-medium">
                    Sign In
                  </button>
                </Link>

                <Link to="/register">
                  <button className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg">
                    Register
                  </button>
                </Link>
              </div>
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-800 hover:text-blue-600 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-6 absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-xl border-t">
              <div className="container px-4 mx-auto">
                <a
                  href="#features"
                  className="block py-3 text-gray-800 hover:text-blue-600 font-medium"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="block py-3 text-gray-800 hover:text-blue-600 font-medium"
                >
                  How It Works
                </a>
                <a
                  href="#about"
                  className="block py-3 text-gray-800 hover:text-blue-600 font-medium"
                >
                  About Us
                </a>
                <a
                  href="#contact"
                  className="block py-3 text-gray-800 hover:text-blue-600 font-medium"
                >
                  Contact
                </a>
                <div className="flex flex-col space-y-3 mt-4">
                  <button className="px-5 py-3 text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors font-medium">
                    Sign In
                  </button>
                  <button className="px-5 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all font-medium shadow-md">
                    Register
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-to-b from-white to-blue-50">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium inline-block mb-6">
                Peer-Powered Learning Platform
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Unlock Knowledge with
                <span className="relative inline-block mx-2">
                  <span className="relative z-10 text-blue-600">Peer</span>
                  <span className="absolute bottom-0 left-0 right-0 h-3 bg-amber-200 z-0"></span>
                </span>
                Learning
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-md">
                Join SkillHive – where community expertise transforms into
                micro-courses. Learn, teach, and grow together in a
                collaborative knowledge ecosystem.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all flex items-center justify-center font-medium shadow-lg shadow-blue-200">
                  Start Learning <ChevronRight size={20} className="ml-2" />
                </button>
                <button className="px-8 py-4 border-2 border-blue-200 text-gray-700 rounded-full hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-center font-medium">
                  Create a Course
                </button>
              </div>
              <div className="mt-10 flex items-center text-gray-600">
                <div className="flex -space-x-3">
                  <img
                    className="w-10 h-10 rounded-full border-2 border-white"
                    src="https://img.freepik.com/premium-photo/memoji-handsome-guy-man-with-glasses-white-background-emoji-cartoon-character_826801-6961.jpg?semt=ais_hybrid&w=740"
                    alt="User avatar"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-white"
                    src="https://img.freepik.com/premium-photo/captivating-cartoon-characters-cute-kids-playful-boys-lovely-girls-digital-world_1142283-45732.jpg?semt=ais_hybrid&w=740"
                    alt="User avatar"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-white"
                    src="https://img.freepik.com/premium-photo/software-engineer-digital-avatar-generative-ai_934475-8997.jpg?semt=ais_hybrid&w=740"
                    alt="User avatar"
                  />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs">
                    +25k
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">
                    Join 25,000+ active learners
                  </p>
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-4 h-4 text-amber-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1 text-xs text-gray-500">
                      4.9/5 rating from peers
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md relative">
                <div className="absolute -top-6 -right-6 bg-amber-100 p-3 rounded-lg shadow-md z-10">
                  <div className="flex items-center">
                    <Clock size={18} className="text-amber-500 mr-2" />
                    <span className="text-sm font-medium">
                      20-min micro-courses
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-green-100 p-3 rounded-lg shadow-md z-10">
                  <div className="flex items-center">
                    <Award size={18} className="text-green-500 mr-2" />
                    <span className="text-sm font-medium">
                      Earn skill badges
                    </span>
                  </div>
                </div>
                <Lottie animationData={teamAnimation} loop={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-15 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              Key Benefits
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Why Choose SkillHive?
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-xl mx-auto">
              Our platform offers unique features designed to enhance your
              learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 group">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <Users
                  size={32}
                  className="text-blue-600 group-hover:text-white transition-colors"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Peer-led Learning
              </h3>
              <p className="text-gray-600">
                Learn directly from peers who have practical experience and
                insights in specific skills.
              </p>
              <div className="mt-6">
                <a
                  href="#"
                  className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                >
                  Learn more <ChevronRight size={16} className="ml-1" />
                </a>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-amber-100 group">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors">
                <BookOpen
                  size={32}
                  className="text-amber-500 group-hover:text-white transition-colors"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Micro-Courses
              </h3>
              <p className="text-gray-600">
                Focus on specific skills with short, targeted courses that fit
                into your busy schedule.
              </p>
              <div className="mt-6">
                <a
                  href="#"
                  className="inline-flex items-center text-amber-500 font-medium hover:text-amber-600"
                >
                  Learn more <ChevronRight size={16} className="ml-1" />
                </a>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 group">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <Award
                  size={32}
                  className="text-blue-600 group-hover:text-white transition-colors"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Progress Tracking
              </h3>
              <p className="text-gray-600">
                Track your learning journey with our comprehensive progress
                tracking system.
              </p>
              <div className="mt-6">
                <a
                  href="#"
                  className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                >
                  Learn more <ChevronRight size={16} className="ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-xl mx-auto">
              Getting started with SkillHive is simple and straightforward
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-24 left-1/3 w-1/3 h-1 bg-blue-200"></div>
            <div className="hidden md:block absolute top-24 right-1/3 w-1/3 h-1 bg-blue-200"></div>

            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center relative z-10 border-b-4 border-blue-600 h-full">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Create Account
                </h3>
                <p className="text-gray-600">
                  Sign up as a learner or instructor and complete your profile
                  with your skills and interests.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center relative z-10 border-b-4 border-amber-500 h-full">
                <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Browse Courses
                </h3>
                <p className="text-gray-600">
                  Explore available courses or create your own to share your
                  knowledge with others.
                </p>
              </div>
            </div>

            <div>
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center border-b-4 border-blue-600 h-full">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Learn & Connect
                </h3>
                <p className="text-gray-600">
                  Enroll in courses, track your progress, and engage with peers
                  in discussion forums.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <button className="px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all inline-flex items-center font-medium">
              Get Started Now <ArrowRight size={20} className="ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-24 bg-white">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12">
              <div className="w-full max-w-md mx-auto relative">
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-blue-100 rounded-lg z-0"></div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-amber-100 rounded-lg z-0"></div>
                <div className="relative z-10">
                  <Lottie animationData={teamAnimation} loop={true} />
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                Our Story
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About SkillHive
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                SkillHive was founded with a simple vision: to create a platform
                where knowledge sharing becomes accessible, engaging, and
                community-driven.
              </p>
              <p className="text-gray-600 mb-8">
                Our platform connects students and professionals who want to
                learn new skills with peers who have the expertise to teach
                them. We believe in the power of collaborative learning and that
                everyone has something valuable to share.
              </p>
              <div className="space-y-4">
                <div className="flex items-start bg-blue-50 p-4 rounded-xl">
                  <div className="mr-4 mt-1 bg-blue-200 rounded-full p-2">
                    <ChevronRight size={18} className="text-blue-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Our Mission</p>
                    <p className="text-gray-600">
                      To democratize education by enabling peer-to-peer
                      knowledge sharing.
                    </p>
                  </div>
                </div>
                <div className="flex items-start bg-amber-50 p-4 rounded-xl">
                  <div className="mr-4 mt-1 bg-amber-200 rounded-full p-2">
                    <ChevronRight size={18} className="text-amber-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Our Vision</p>
                    <p className="text-gray-600">
                      A world where learning is accessible, collaborative, and
                      lifelong.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-amber-500">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-amber-500 font-medium">Active Learners</div>
            </div>
            <div className="p-6 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">250+</div>
              <div className="text-amber-500 font-medium">Instructors</div>
            </div>
            <div className="p-6 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-amber-500 font-medium">Micro-Courses</div>
            </div>
            <div className="p-6 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-amber-500 font-medium">
                Skills Categories
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              What Our Users Say
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-xl mx-auto">
              Hear from our community of learners and instructors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-blue-100">
              <div className="flex items-center mb-6">
                <img
                  className="w-12 h-12 rounded-full mr-4"
                  src="/api/placeholder/48/48"
                  alt="User"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                  <p className="text-sm text-gray-600">UX Designer</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex text-amber-500 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic">
                  "SkillHive transformed how I learn new skills. The peer-led
                  courses are practical and the community support is
                  incredible."
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border border-amber-100">
              <div className="flex items-center mb-6">
                <img
                  className="w-12 h-12 rounded-full mr-4"
                  src="/api/placeholder/48/48"
                  alt="User"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Michael Chen</h4>
                  <p className="text-sm text-gray-600">Software Developer</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex text-amber-500 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic">
                  "I've both taught and learned on SkillHive. The platform makes
                  sharing knowledge easy and rewarding for everyone involved."
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border border-blue-100">
              <div className="flex items-center mb-6">
                <img
                  className="w-12 h-12 rounded-full mr-4"
                  src="/api/placeholder/48/48"
                  alt="User"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Emma Rodriguez
                  </h4>
                  <p className="text-sm text-gray-600">Marketing Specialist</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex text-amber-500 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic">
                  "SkillHive's micro-courses helped me upskill quickly and stay
                  competitive in my field."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              Get in Touch
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Contact Us
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-xl mx-auto">
              Have questions? We're here to help you get started or answer any
              inquiries.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/2">
              <form className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="mb-6">
                  <label
                    htmlFor="name"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="email"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="Your email"
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="message"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none transition-all h-32 resize-none"
                    placeholder="Your message"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all font-medium"
                >
                  Send Message
                </button>
              </form>
            </div>
            <div className="md:w-1/2">
              <div className="bg-blue-50 p-8 rounded-2xl h-full">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  Contact Information
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <Mail size={24} className="text-blue-600 mr-4" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">support@skillhive.com</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone size={24} className="text-blue-600 mr-4" />
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={24} className="text-blue-600 mr-4" />
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-gray-600">
                        123 Learning Lane, Education City, EC 12345
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <h4 className="font-medium text-gray-900 mb-4">Follow Us</h4>
                  <div className="flex space-x-4">
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <FaTwitter size={24} />
                    </a>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <FaLinkedin size={24} />
                    </a>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <FaInstagram size={24} />
                    </a>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <FaFacebook size={24} />
                    </a>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <FaGithub size={24} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-800 text-white py-12">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-blue-200 font-bold text-2xl mb-4">
                Skill<span className="text-amber-500">Hive</span>
              </div>
              <p className="text-blue-100">
                Empowering peer-to-peer learning and knowledge sharing for
                students and professionals.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-blue-100 hover:text-amber-500 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-blue-100 hover:text-amber-500 transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-blue-100 hover:text-amber-500 transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-blue-100 hover:text-amber-500 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-amber-500 transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-amber-500 transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-amber-500 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-amber-500 transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Stay Connected</h4>
              <p className="text-blue-100 mb-4">
                Subscribe to our newsletter for updates and learning tips.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 rounded-l-full bg-blue-900 text-blue-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button className="px-4 py-2 bg-amber-500 text-white rounded-r-full hover:bg-amber-600 transition-colors">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-blue-700 text-center">
            <p className="text-blue-100">
              © {new Date().getFullYear()} SkillHive. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
