import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SendIcon, UserIcon, LandmarkIcon, CalendarIcon, ClockIcon, MicIcon, Languages } from 'lucide-react';
import { sendBookingData } from "@/lib/api";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from 'react-time-picker';
import { loadStripe } from '@stripe/stripe-js';
import 'react-time-picker/dist/TimePicker.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../app/globals.css';

const languages = {
    English: {
        initialMessage: "Welcome to the National Museum of Art! I'm MuseMate, your personal guide. How may I assist you today? You can ask about exhibitions, ticket booking, or museum information.",
        greetings: "Hi, I am MuseMate. How can I help you?",
        exhibitions: `Current Exhibitions:\n1. Harappan Culture\n2. Critical Zones: In Search of A Common Ground\n3. Bodhi Yatra\n4. Jarracharra: Dry Season Wind\n5. Aadi Chitra`,
        gallery: "Choose the gallery from this list:",
        openingHours: `Opening Hours:\nMonday - Saturday: 9 AM - 6 PM\nSunday: 10 AM - 4 PM`,
        admissionFees: `Admission Fees:\nAdults: Rs.15\nStudents & Seniors: Rs.10\nChildren (under 12): Free`,
        noEvents: "Currently, there are no special events. Kindly book tickets for exclusive access.",
        datePrompt: "Please select a date for your visit:",
        billprompt: "Your booking has been saved successfully.",
        timePrompt: "Great! Let's move further. Book your time so that the time can be allotted only to you.",
        visitorsPrompt: "How many of you are visiting?",
        adultLabel: "Adult",
        adultPlaceholder: "Number of Adults",
        seniorLabel: "Senior/Student",
        seniorPlaceholder: "Number of Students/Seniors",
        generateBill: "Generate Bill",
        datePlaceholder: "Select a date",
        inputPlaceholder: "Type your message...",
        payWithStripe: "Pay with Stripe",
        selectDateTimeError: "Please select both date and time before generating the bill.",
        paymentSuccess: "Your booking has been saved successfully.",
        successMessage: "Payment successful! Your booking is confirmed. Thank you for visiting the National Museum of Art.",
        paymentError: "An error occurred while saving your booking. Please try again.",
        botErrorMessage: "I'm sorry, I didn't understand that. Can you please rephrase your question?",
        listening: "Listening...",
        errorListening: "An error occurred while listening. Please try again.",
        stoppedListening: "Stopped listening.",
        keywords: {
            book: ['book', 'ticket'],
            exhibitions: ['exhibitions', 'displays'],
            openingHours: ['opening hours', 'timings'],
            admissionFees: ['prices', 'fees', 'admission'],
            specialEvents: ['special events', 'events']
        }
    },
    Hindi: {
        initialMessage: "राष्ट्रीय कला संग्रहालय में आपका स्वागत है! मैं म्यूजमेट हूँ, आपका व्यक्तिगत गाइड। मैं आज आपकी किस प्रकार सहायता कर सकता हूँ? आप प्रदर्शनियों, टिकट बुकिंग या संग्रहालय की जानकारी पूछ सकते हैं।",
        greetings: "नमस्ते, मैं म्यूजमेट हूँ। मैं आपकी किस प्रकार सहायता कर सकता हूँ?",
        exhibitions: `वर्तमान प्रदर्शनियाँ:\n1. हड़प्पा संस्कृति\n2. महत्वपूर्ण क्षेत्र: एक साझा जमीन की खोज\n3. बोधि यात्रा\n4. जर्राचर्रा: शुष्क मौसम की हवा\n5. आदि चित्र`,
        gallery: "इस सूची में से गैलरी चुनें:",
        openingHours: `खुलने का समय:\nसोमवार - शनिवार: सुबह 9 बजे - शाम 6 बजे\nरविवार: सुबह 10 बजे - दोपहर 4 बजे`,
        admissionFees: `प्रवेश शुल्क:\nवयस्क: रु.15\nछात्र और वरिष्ठ नागरिक: रु.10\nबच्चे (12 वर्ष से कम): निःशुल्क`,
        noEvents: "वर्तमान में कोई विशेष कार्यक्रम नहीं है। कृपया विशिष्ट प्रवेश के लिए टिकट बुक करें।",
        datePrompt: "कृपया अपनी यात्रा की तारीख चुनें:",
        billprompt: "आपकी बुकिंग सफलतापूर्वक सहेज ली गई है।",
        timePrompt: "बढ़िया! चलिए आगे बढ़ते हैं। समय बुक करें ताकि समय केवल आपके लिए आवंटित हो सके।",
        visitorsPrompt: "कितने लोग आ रहे हैं?",
        adultLabel: "वयस्क",
        adultPlaceholder: "वयस्कों की संख्या",
        seniorLabel: "वरिष्ठ/छात्र",
        seniorPlaceholder: "छात्रों/वरिष्ठों की संख्या",
        generateBill: "बिल जनरेट करें",
        datePlaceholder: "एक तारीख चुनें",
        inputPlaceholder: "अपना संदेश टाइप करें...",
        payWithStripe: "Stripe के साथ भुगतान करें",
        selectDateTimeError: "कृपया बिल जनरेट करने से पहले तिथि और समय दोनों का चयन करें।",
        paymentSuccess: "आपकी बुकिंग सफलतापूर्वक सहेज ली गई है।",
        paymentError: "आपकी बुकिंग सहेजने में एक त्रुटि हुई। कृपया पुनः प्रयास करें।",
        botErrorMessage: "मुझे खेद है, मैं इसे समझ नहीं पाया। क्या आप कृपया अपने प्रश्न को फिर से बता सकते हैं?",
        listening: "सुन रहे हैं...",
        errorListening: "सुनने के दौरान एक त्रुटि हुई। कृपया पुनः प्रयास करें।",
        stoppedListening: "सुनना बंद कर दिया।",
        keywords: {
            book: ['बुक', 'टिकट'],
            exhibitions: ['प्रदर्शनियाँ', 'डिस्प्ले'],
            openingHours: ['खुलने का समय', 'समय'],
            admissionFees: ['प्रवेश शुल्क', 'फीस'],
            specialEvents: ['विशेष कार्यक्रम', 'इवेंट्स']
        }
    },
    Bengali: {
        initialMessage: "ন্যাশনাল মিউজিয়াম অফ আর্ট-এ আপনাকে স্বাগতম! আমি মিউজমেট, আপনার ব্যক্তিগত গাইড। আমি কীভাবে আপনাকে সাহায্য করতে পারি? আপনি প্রদর্শনী, টিকিট বুকিং বা মিউজিয়াম সম্পর্কিত তথ্য জানতে পারেন।",
        greetings: "হাই, আমি মিউজমেট। আমি কীভাবে সাহায্য করতে পারি?",
        exhibitions: `বর্তমান প্রদর্শনী:\n1. হরপ্পান সভ্যতা\n2. ক্রিটিক্যাল জোনস: একটি সাধারণ জমি অনুসন্ধানে\n3. বোধি যাত্রা\n4. জারাচার্রা: শুকনো ঋতুর বাতাস\n5. আদি চিত্র`,
        gallery: "এই তালিকা থেকে গ্যালারিটি বেছে নিন:",
        openingHours: `খোলার সময়:\nসোমবার - শনিবার: সকাল ৯টা - সন্ধ্যা ৬টা\nরবিবার: সকাল ১০টা - বিকাল ৪টা`,
        admissionFees: `প্রবেশ মূল্য:\nবয়স্ক: ১৫ টাকা\nছাত্র ও প্রবীণ: ১০ টাকা\nশিশুরা (১২ বছরের নিচে): ফ্রি`,
        noEvents: "বর্তমানে কোনো বিশেষ ইভেন্ট নেই। এক্সক্লুসিভ অ্যাক্সেসের জন্য অনুগ্রহ করে টিকিট বুক করুন।",
        datePrompt: "আপনার পরিদর্শনের জন্য একটি তারিখ নির্বাচন করুন:",
        billprompt: "আপনার বুকিং সফলভাবে সংরক্ষিত হয়েছে।",
        timePrompt: "দারুণ! চলুন এগিয়ে যাই। আপনার সময় বুক করুন যাতে সময় শুধুমাত্র আপনার জন্য নির্ধারিত থাকে।",
        visitorsPrompt: "আপনার দলের কয়জন আসছেন?",
        adultLabel: "বয়স্ক",
        adultPlaceholder: "বয়স্কদের সংখ্যা",
        seniorLabel: "প্রবীণ/ছাত্র",
        seniorPlaceholder: "ছাত্র/প্রবীণদের সংখ্যা",
        generateBill: "বিল তৈরি করুন",
        datePlaceholder: "তারিখ নির্বাচন করুন",
        inputPlaceholder: "আপনার বার্তা টাইপ করুন...",
        payWithStripe: "স্ট্রাইপ দিয়ে পেমেন্ট করুন",
        selectDateTimeError: "বিল তৈরি করার আগে অনুগ্রহ করে তারিখ এবং সময় উভয়ই নির্বাচন করুন।",
        paymentSuccess: "আপনার বুকিং সফলভাবে সংরক্ষণ করা হয়েছে।",
        paymentError: "আপনার বুকিং সংরক্ষণ করতে একটি ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
        botErrorMessage: "দুঃখিত, আমি সেটা বুঝতে পারিনি। অনুগ্রহ করে আপনার প্রশ্নটি পুনরায় বলবেন কি?",
        listening: "শোনার মধ্যে...",
        errorListening: "শোনার সময় একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
        stoppedListening: "শোনা বন্ধ করা হয়েছে।",
        keywords: {
            book: ['বুক', 'টিকিট'],
            exhibitions: ['প্রদর্শনী', 'ডিসপ্লে'],
            openingHours: ['খোলার সময়', 'সময়'],
            admissionFees: ['প্রবেশ ফি', 'ফি'],
            specialEvents: ['বিশেষ ইভেন্ট', 'ইভেন্ট']
        }
    },
};
type Message = {
    text: string;
    sender: 'user' | 'bot';
};

type Language = 'English' | 'Hindi' | 'Bengali';

const initialMessagesEnglish: Message[] = [
    { text: languages.English.initialMessage, sender: 'bot' },
];

const initialMessagesHindi: Message[] = [
    { text: languages.Hindi.initialMessage, sender: 'bot' },
];

const initialMessagesBengali: Message[] = [
    { text: languages.Bengali.initialMessage, sender: 'bot' },
];

const galleryList = [
  "Archaeology Gallery",
  "Bharhut Gallery",
  "Birds Gallery",
  "Botany Gallery",
  "Bronze Gallery",
  "Coin Gallery",
  "Decorative Art Gallery",
  "Egyptian Gallery",
  "Fish Gallery",
  "Gandhara Gallery",
  "Insect Gallery",
  "Mammal Gallery"
];

export default function Component() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [adults, setAdults] = useState<number>(0);
    const [seniors, setSeniors] = useState<number>(0);
    const [billDetails, setBillDetails] = useState<string | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Hindi' | 'Bengali'>('English');
    const [isListening, setIsListening] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);
    const [isDateTimeMessageShown, setIsDateTimeMessageShown] = useState(false);
    const [isVisitorsMessageSpoken, setIsVisitorsMessageSpoken] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState<string | null>(null);
    const [showGalleryPicker, setShowGalleryPicker] = useState(false);
    const [hasSpokenTimeSelected, setHasSpokenTimeSelected] = useState(false);
    const [speechRecognition, setSpeechRecognition] = useState<any>(null);
    const [synth, setSynth] = useState<any>(null);
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            setSpeechRecognition(new SpeechRecognition());
            const synth = window.speechSynthesis;
            setSynth(synth);

            // Set the initial messages and speak the initial welcome message
            setSelectedLanguage('English');
        }
    }, []);

    useEffect(() => {
        if (selectedLanguage === 'English' && messages.length === 0) {
            // Initialize messages with English welcome message on component load
            setMessages(initialMessagesEnglish);
        }
    }, [selectedLanguage, messages]);

    useEffect(() => {
        if (messages.length > 0) {
            handleBotSpeech(messages[messages.length - 1].text);
        }
    }, [messages]);

    useEffect(() => {
        scrollAreaRef.current?.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }, [messages]);

    const handleBotSpeech = (text: string) => {
        if (synth) {
            const utterance = new SpeechSynthesisUtterance(text);
    
            // Define a function to set the voice for the utterance
            const setVoice = () => {
                const voices = synth.getVoices() as SpeechSynthesisVoice[]; // Type assertion for voices
    
                // Set the language and voice based on the selected language
                switch (selectedLanguage) {
                    case 'English':
                        utterance.lang = 'en-US';
                        utterance.voice = voices.find(voice => voice.lang === 'en-US') || null;
                        break;
                    case 'Hindi':
                        utterance.lang = 'hi-IN';
                        utterance.voice = voices.find(voice => voice.lang === 'hi-IN') || null;
                        break;
                    case 'Bengali':
                        utterance.lang = 'BN-IN';
                        utterance.voice = voices.find(voice => voice.lang === 'bn-IN') || null;
                        break;
                    default:
                        utterance.lang = 'en-US';
                        utterance.voice = voices[0] || null; // Fallback to the first available voice if none is found
                        break;
                }
    
                // Log the voice information for debugging
                console.log(`Speaking in ${utterance.lang}: ${text}`);
                if (utterance.voice) {
                    console.log(`Voice: ${utterance.voice.name}`);
                } else {
                    console.warn('No specific voice found, using default or first available voice');
                }
    
                synth.speak(utterance);
            };
    
            if (synth.getVoices().length === 0) {
                synth.onvoiceschanged = setVoice;
            } else {
                setVoice();
            }
        }
    };

    // Handle language change
    const handleLanguageChange = (language: string) => {
        setSelectedLanguage(language as 'English' | 'Hindi' | 'Bengali');
        if (language === 'English') {
            setMessages(initialMessagesEnglish);
        } else if (language === 'Hindi') {
            setMessages(initialMessagesHindi);
        } else {
            setMessages(initialMessagesBengali);
        }
        setInput('');
    };  

    const handleVoiceInput = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        // Set language based on the user's selection
        if (selectedLanguage === 'Hindi') {
            recognition.lang = 'hi-IN';
        } else if (selectedLanguage === 'English') {
            recognition.lang = 'en-US';
        } else if (selectedLanguage === 'Bengali') {
            recognition.lang = 'bn-IN';
        }
        
        recognition.interimResults = false; // Only send final results
        recognition.maxAlternatives = 1;
    
        recognition.start();
    
        recognition.onstart = () => {
            setMessages(prev => [...prev, { text: languages[selectedLanguage].listening, sender: 'bot' }]);
        };
    
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript); // Set the input to the recognized text
            setMessages(prev => [...prev, { text: transcript, sender: 'user' }]);
            handleSend(); // Automatically send the recognized input as a message
        };
    
        recognition.onerror = (event: any) => {
            setMessages(prev => [...prev, { text: languages[selectedLanguage].errorListening, sender: 'bot' }]);
        };
    
        recognition.onend = () => {
            setMessages(prev => [...prev, { text: languages[selectedLanguage].stoppedListening, sender: 'bot' }]);
        };
    };    

    const handleSend = async () => {
        if (input.trim()) {
            setMessages([...messages, { text: input, sender: 'user' }]);
            setInput('');

            const userInput = input.toLowerCase();
            let botResponse = languages[selectedLanguage].botErrorMessage;

            const containsKeyword = (keywords: string[]) => {
                return keywords.some(keyword => userInput.includes(keyword.toLowerCase()));
            };

            if (containsKeyword(languages[selectedLanguage].keywords.book)) {
                botResponse = languages[selectedLanguage].gallery;
                setShowGalleryPicker(true);
            } else if (containsKeyword(languages[selectedLanguage].keywords.exhibitions)) {
                botResponse = languages[selectedLanguage].exhibitions;
            } else if (containsKeyword(languages[selectedLanguage].keywords.openingHours)) {
                botResponse = languages[selectedLanguage].openingHours;
            } else if (containsKeyword(languages[selectedLanguage].keywords.admissionFees)) {
                botResponse = languages[selectedLanguage].admissionFees;
            } else if (containsKeyword(languages[selectedLanguage].keywords.specialEvents)) {
                botResponse = languages[selectedLanguage].noEvents;
            } else if (userInput.includes('hello') || userInput.includes('hey') || userInput.includes('hi')) {
                botResponse = languages[selectedLanguage].greetings;
            }

            setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
        }
    };    

    const handleGallerySelect = (gallery: string) => {
        setSelectedGallery(gallery);
        setShowGalleryPicker(false);
    
        // Define messages for each language
        let selectedGalleryMessage: string;
        if (selectedLanguage === 'English') {
            selectedGalleryMessage = `You have selected ${gallery}.`;
        } else if (selectedLanguage === 'Hindi') {
            selectedGalleryMessage = `आपने ${gallery} चुना है।`;
        } else if (selectedLanguage === 'Bengali') {
            selectedGalleryMessage = `আপনি ${gallery} নির্বাচন করেছেন।`;
        } else {
            // Default to English if the language is not recognized
            selectedGalleryMessage = `You have selected ${gallery}.`;
        }
    
        setMessages(prev => [...prev, { text: selectedGalleryMessage, sender: 'bot' }]);
        
        setTimeout(() => {
            setShowDatePicker(true);
            setMessages(prev => [...prev, { text: languages[selectedLanguage].datePrompt, sender: 'bot' }]);
        }, 1000);
    };
  
  
    const handleDateChange = (date: Date | null) => {
      setSelectedDate(date);
      setShowDatePicker(false);
  
      if (date) {
          let selectedDateMessage;
          if (selectedLanguage === 'English') {
              selectedDateMessage = `You've selected ${date.toDateString()}.`;
          } else if (selectedLanguage === 'Hindi') {
              selectedDateMessage = `आपने ${date.toDateString()} चुना है।`;
          } else {
              selectedDateMessage = `আপনি ${date.toDateString()} তারিখটি নির্বাচন করেছেন।`;
          }
  
          let nextStepMessage;
          if (selectedLanguage === 'English') {
              nextStepMessage = "Great! Let's move further. Book your time so that the time can be allotted only to you.";
          } else if (selectedLanguage === 'Hindi') {
              nextStepMessage = "बहुत बढ़िया! चलिए आगे बढ़ते हैं। समय बुक करें ताकि समय केवल आपके लिए आवंटित हो सके।";
          } else {
              nextStepMessage = "দারুণ! চলুন এগিয়ে যাই। আপনার সময় বুক করুন যাতে সময় শুধুমাত্র আপনার জন্য নির্ধারিত থাকে।";
          }
  
          setMessages(prev => [...prev, { text: selectedDateMessage, sender: 'bot' }]);
          setTimeout(() => {
              setMessages(prev => [...prev, { text: nextStepMessage, sender: 'bot' }]);
              setShowTimePicker(true); // Show time picker after selecting date
          }, 1000);
      }
  };
  
  const handleTimeChange = (time: string | null) => {
    if (time === null) {
      // Handle the null case if needed, e.g., reset time or show an error message
      return;
    }
  
    const [hours, minutes] = time.split(':').map(Number);
    const selectedDateDay = selectedDate?.getDay();
  
    // Checking if the time is valid
    const isValidTime = (hours >= 9 && hours < 18 && selectedDateDay !== 0) || (hours >= 10 && hours < 16 && selectedDateDay === 0);
  
    let validTimeMessage;
    if (selectedLanguage === 'English') {
      validTimeMessage = `You've selected ${time}.`;
    } else if (selectedLanguage === 'Hindi') {
      validTimeMessage = `आपने ${time} चुना है।`;
    } else {
      validTimeMessage = `আপনি ${time} সময়টি নির্বাচন করেছেন।`;
    }
  
    let invalidTimeMessage;
    if (selectedLanguage === 'English') {
      invalidTimeMessage = "Please select a time within the allowed range.";
    } else if (selectedLanguage === 'Hindi') {
      invalidTimeMessage = "कृपया निर्दिष्ट समय सीमा के भीतर एक समय चुनें।";
    } else {
      invalidTimeMessage = "অনুগ্রহ করে অনুমোদিত সীমার মধ্যে একটি সময় নির্বাচন করুন।";
    }
  
    if (isValidTime) {
      setSelectedTime(time);
      setShowTimePicker(false);
  
      setMessages(prev => [...prev, { text: validTimeMessage, sender: 'bot' }]);
  
      if (!hasSpokenTimeSelected) {
        let botSpeechMessage;
        if (selectedLanguage === 'English') {
          botSpeechMessage = `You have selected ${time}`;
        } else if (selectedLanguage === 'Hindi') {
          botSpeechMessage = `आपने ${time} चुना है`;
        } else {
          botSpeechMessage = `আপনি ${time} সময়টি নির্বাচন করেছেন।`;
        }
        handleBotSpeech(botSpeechMessage);
        setHasSpokenTimeSelected(true);
      }
  
      handleVisitors();
    } else {
      setMessages(prev => [...prev, { text: invalidTimeMessage, sender: 'bot' }]);
    }
  };
    
      
    
    const handleVisitors = () => {
        setMessages(prev => [...prev, { text: languages[selectedLanguage].visitorsPrompt, sender: 'bot' }]);
    };
    

    const handleBillGeneration = async () => {
        if (!selectedDate || !selectedTime) {
          if (!isDateTimeMessageShown) {
            setMessages(prev => [...prev, { text: "Please select both date and time before generating the bill.", sender: 'bot' }]);
            setIsDateTimeMessageShown(true); 
          }
          return;
    }

    const total = 15 * adults + 10 * seniors;

    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text("Museum Visit Bill", 10, 20);
    pdf.setFontSize(12);
    pdf.text(`Date: ${selectedDate.toDateString()}`, 10, 30);
    pdf.text(`Time: ${selectedTime}`, 10, 40);
    pdf.text(`Adults: Rs.15 * ${adults} = Rs.${15 * adults}`, 10, 50);
    pdf.text(`Students/Seniors: Rs.10 * ${seniors} = Rs.${10 * seniors}`, 10, 60);
    pdf.text(`Total: Rs.${total}`, 10, 70);

    pdf.save('bill.pdf');

    const billText = `
      <h2>Museum Visit Bill</h2>
      <p><strong>Gallery:</strong> ${selectedGallery}</p>
      <p><strong>Date:</strong> ${selectedDate.toDateString()}</p>
      <p><strong>Time:</strong> ${selectedTime}</p>
      <p><strong>Adults:</strong> Rs.15 * ${adults} = Rs.${15 * adults}</p>
      <p><strong>Students/Seniors:</strong> Rs.10 * ${seniors} = Rs.${10 * seniors}</p>
      <p><strong>Total:</strong> Rs.${total}</p>
    `;

    setBillDetails(billText);

    try {
      await sendBookingData({
        gallery: selectedGallery,
        date: selectedDate.toDateString(),
        time: selectedTime,
        adults,
        seniors,
        total
      });
      setMessages(prev => [...prev, { text: languages[selectedLanguage].billprompt, sender: 'bot' }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "An error occurred while saving your booking. Please try again.", sender: 'bot' }]);
    }
  };

  const handlePayment = async () => {
    try {
      const total = 15 * adults + 10 * seniors;
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ total, language: selectedLanguage }), // Pass the selected language to the API
      });
  
      // Check if the response is JSON before parsing
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.indexOf('application/json') !== -1) {
        const data = await response.json();
  
        if (response.ok) {
          const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string;
          const stripe = await loadStripe(stripePublicKey);
  
          if (stripe) {
            const { sessionId } = data;
            const { error } = await stripe.redirectToCheckout({ sessionId });
  
            if (error) {
              console.error('Error:', error);
            }
          } else {
            console.error('Stripe failed to initialize.');
          }
        } else {
          console.error('API Error:', data);
        }
      } else {
        // If it's not JSON, log the error (most likely HTML)
        const errorText = await response.text();
        console.error('Server returned non-JSON response:', errorText);
      }
    } catch (error) {
      console.error('Payment Error:', error);
    }
  };
  
  
  

  return (
    <div className="min-h-screen bg-[#f5f2e8] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <LandmarkIcon className="w-full h-full text-[#8b7d6b]" />
      </div>
      <Card className="w-full max-w-md bg-[#fffbf0]/90 backdrop-blur-sm shadow-lg border-[#d3c7a6]">
        <CardHeader className="bg-[#8b7d6b] text-white rounded-t-lg flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
            <LandmarkIcon className="mr-2 h-6 w-6" />
            MuseMate
          </CardTitle>
          <select 
            value={selectedLanguage} 
            onChange={(e) => handleLanguageChange(e.target.value)} 
            className="bg-[#8b7d6b] text-white p-1 rounded-md"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Bengali">Bengali</option>
          </select>
        </CardHeader>
        <CardContent className="pt-6">
        <ScrollArea className="h-[400px] pr-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-[#8b7d6b] text-white'
                    : 'bg-[#e8e0cc] text-[#5c4f3d]'
                }`}
              >
                {message.sender === 'bot' && (
                  <UserIcon className="inline-block mr-2 h-4 w-4" />
                )}
                {message.text}
              </div>
            </div>
          ))}

          {/* Gallery Picker */}
          {messages.some(message => message.text.includes(languages[selectedLanguage].gallery)) && !selectedGallery && (
            <div className="mt-4">
              {galleryList.map((gallery, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="radio"
                    id={`gallery-${index}`}
                    name="gallery"
                    value={gallery}
                    onChange={() => handleGallerySelect(gallery)}
                    className="mr-2"
                  />
                  <label htmlFor={`gallery-${index}`} className="text-sm text-gray-600">
                    {gallery}
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* Date picker */}
          {messages.some(message => message.text.includes(languages[selectedLanguage].datePrompt)) &&
            selectedGallery && !selectedDate && (
              <div className="relative mt-4">
                <CalendarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  className="w-full p-2 pl-8 border rounded-lg"
                  placeholderText={languages[selectedLanguage].datePlaceholder}
                />
              </div>
          )}

          {/* Time picker */}
          {messages.some(message => message.text.includes(languages[selectedLanguage].timePrompt)) &&
            selectedGallery && selectedDate && !selectedTime && (
              <div className="relative mt-4">
                <ClockIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <TimePicker
                  onChange={handleTimeChange}
                  value={selectedTime}
                  className="w-full p-2 pl-8 border rounded-lg"
                  disableClock={true}
                />
              </div>
          )}

          {/* Visitor count */}
          {messages.some(message => message.text.includes(languages[selectedLanguage].visitorsPrompt)) &&
            selectedGallery && selectedDate && selectedTime && (
              <div className="mt-4">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">{languages[selectedLanguage].adultLabel}</label>
                  <Input
                    type="number"
                    placeholder={languages[selectedLanguage].adultPlaceholder}
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">{languages[selectedLanguage].seniorLabel}</label>
                  <Input
                    type="number"
                    placeholder={languages[selectedLanguage].seniorPlaceholder}
                    value={seniors}
                    onChange={(e) => setSeniors(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleBillGeneration}
                  className="w-full bg-[#8b7d6b] text-white hover:bg-[#6a4f3b]"
                >
                  {languages[selectedLanguage].generateBill}
                </Button>
              </div>
          )}

          {/* Bill details */}
          {billDetails && (
            <div className="mt-4 p-4 border rounded-lg bg-[#f5f2e8]">
              <div dangerouslySetInnerHTML={{ __html: billDetails }} />
              <Button
                onClick={handlePayment}
                className="w-full mt-4 bg-[#8b7d6b] text-white hover:bg-[#6a4f3b]"
              >
                {languages[selectedLanguage].payWithStripe}
              </Button>
            </div>
          )}
        </ScrollArea>


        </CardContent>
        <CardFooter>
          <div className="flex items-center">
            <Input
              type="text"
              placeholder={languages[selectedLanguage].inputPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 p-2 border rounded-l-lg"
            />
            <Button onClick={handleVoiceInput}>
              <MicIcon className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleSend}
              className="bg-[#8b7d6b] text-white rounded-r-lg"
            >
              <SendIcon className="h-5 w-5" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
