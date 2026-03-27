// ========== IMPORTS ==========
import {
  IonPage,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonText
} from '@ionic/react';
import { useState } from 'react';
import ProfileCard from '../components/ProfileCard'; // Import ProfileCard component

// ========== ANIMATION STYLES ==========
// CSS animation styles for loading indicator dots
// Creates a left-to-right flowing animation with 3 dots
const dotAnimationStyle = `
  @keyframes dotRun {
    0%, 20% { transform: translateX(-10px); opacity: 0; }
    50% { opacity: 1; }
    80%, 100% { transform: translateX(20px); opacity: 0; }
  }
  .loading-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #3b82f6;
    margin: 0 4px;
    animation: dotRun 1.4s infinite;
  }
  .loading-dot:nth-child(1) { animation-delay: 0s; }
  .loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .loading-dot:nth-child(3) { animation-delay: 0.4s; }
`;

const Home: React.FC = () => {
  // ========== STATE MANAGEMENT ==========
  // All form-related state variables
  const [contact, setContact] = useState<string>(''); // Stores phone/contact number input
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']); // Array of 6 OTP digits
  const [password, setPassword] = useState<string>(''); // Stores password input
  const [error, setError] = useState<string>(''); // Stores error messages for display
  const [loading, setLoading] = useState<boolean>(false); // Controls loading animation state
  const [success, setSuccess] = useState<string>(''); // Stores success message after login
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp'); // Toggle between login methods
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // Tracks if user is logged in
  const [userProfile, setUserProfile] = useState<{username: string, contact: string} | null>(null); // Stores logged in user data
  const otpRefs = Array(6).fill(null).map(() => ({ current: null as any })); // Unused ref array - can be removed

  // ========== OTP INPUT HANDLER ==========
  // Handles digit input in OTP boxes with auto-focus to next box
  const handleOtpInput = (index: number, value: string) => {
    // Validation: Allow only single digit
    if (value.length > 1) return;
    // Validation: Allow only numeric digits or empty string
    if (!/^\d*$/.test(value)) return;
    
    // Update OTP state with new digit at specific index
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next box when digit is entered
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // ========== OTP KEYDOWN HANDLER ==========
  // Handles special keys (Backspace, Arrow keys) for OTP navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // BACKSPACE: Delete digit and navigate backward if needed
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      const newOtp = [...otp];
      if (otp[index]) {
        // If current box has a digit, clear it
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // If current box is empty, move to previous box and clear it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
        }
      }
    } 
    // ARROW LEFT: Move focus to previous box
    else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    } 
    // ARROW RIGHT: Move focus to next box
    else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // ========== LOGIN HANDLER ==========
  // Main login validation and submission logic
  const handleLogin = () => {
    // Validation 1: Check if contact number is provided
    if (!contact) {
      setError('Contact number is required');
      return;
    }

    // Validation 2: Check if contact number is at least 10 digits
    if (contact.length < 10) {
      setError('Enter a valid contact number');
      return;
    }

    // Conditional validation based on selected login method
    if (loginMethod === 'otp') {
      // OTP Method: Join all digits and validate length
      const otpString = otp.join('');
      if (otpString.length !== 6) {
        setError('Please enter all 6 OTP digits');
        return;
      }
      setError(''); // Clear any previous errors
    } else {
      // Password Method: Validate password is not empty
      if (!password) {
        setError('Please enter your password');
        return;
      }
      setError(''); // Clear any previous errors
    }

    // Start loading animation
    setLoading(true);
    setSuccess('');

    // Simulate API call with 2 second delay (replace with actual API call)
    setTimeout(() => {
      setLoading(false);
      setSuccess('Login successful! Redirecting...');
      // Log login details to console for debugging
      console.log('Login via', loginMethod === 'otp' ? 'OTP' : 'Password', '- Contact:', contact);

      // Set user as logged in and create profile data
      setIsLoggedIn(true);
      setUserProfile({
        username: `User_${contact.slice(-4)}`, // Create username from last 4 digits
        contact: contact
      });

      // Auto-clear success message after 2 seconds
      setTimeout(() => {
        setSuccess('');
      }, 2000);
    }, 2000);
  };

  // ========== LOGOUT HANDLER ==========
  // Clears user session and returns to login form
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserProfile(null);
    setContact('');
    setPassword('');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setSuccess('');
  };

  return (
    <IonPage>
      {/* Inject loading animation CSS styles */}
      <style>{dotAnimationStyle}</style>
      
      <IonContent className="ion-padding">
        {/* ========== HEADER SECTION ========== */}
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <h1>SafeNode</h1>
          <p>{isLoggedIn ? 'Dashboard' : 'Secure Login'}</p>
        </div>

        {/* ========== CONDITIONAL RENDERING ========== */}
        {isLoggedIn && userProfile ? (
          // ========== DASHBOARD VIEW ==========
          <div style={{ marginTop: '40px' }}>
            {/* Welcome Message */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <IonText>
                <h2>Welcome back!</h2>
              </IonText>
            </div>

            {/* Profile Card Component */}
            <ProfileCard
              username={userProfile.username}
              contact={userProfile.contact}
            />

            {/* Logout Button */}
            <IonButton
              expand="block"
              color="medium"
              style={{ marginTop: '30px' }}
              onClick={handleLogout}
            >
              Logout
            </IonButton>
          </div>
        ) : (
          // ========== LOGIN FORM VIEW ==========
          <div style={{ marginTop: '40px' }}>
          {/* Contact Number Input Field */}
          <IonItem>
            <IonLabel position="floating">Contact Number</IonLabel>
            <IonInput
              type="tel"
              value={contact}
              onIonChange={(e) => setContact(e.detail.value!)}
            />
          </IonItem>

          {/* ========== LOGIN METHOD TOGGLE ========== */}
          {/* Buttons to switch between OTP and Password authentication */}
          <div style={{ marginTop: '20px', marginBottom: '20px', textAlign: 'center' }}>
            <p style={{ color: '#666', marginBottom: '10px' }}>Login Method:</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {/* OTP Button */}
              <button
                onClick={() => setLoginMethod('otp')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: loginMethod === 'otp' ? '#3b82f6' : '#e5e7eb',
                  color: loginMethod === 'otp' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                OTP
              </button>
              {/* Password Button */}
              <button
                onClick={() => setLoginMethod('password')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: loginMethod === 'password' ? '#3b82f6' : '#e5e7eb',
                  color: loginMethod === 'password' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Password
              </button>
            </div>
          </div>

          {/* ========== CONDITIONAL AUTHENTICATION SECTION ========== */}
          {loginMethod === 'otp' ? (
            // OTP Input Section: 6 individual digit boxes
            <div style={{ marginTop: '20px', marginBottom: '10px' }}>
              <p style={{ textAlign: 'center', color: '#999', marginBottom: '15px' }}>Enter OTP</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                {/* Map through 6 OTP boxes */}
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`} // Unique ID for DOM reference
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpInput(index, e.currentTarget.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    autoFocus={index === 0} // Focus first box on render
                    style={{
                      width: '50px',
                      height: '50px',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      border: '2px solid #ccc',
                      borderRadius: '8px',
                      padding: '8px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="•"
                  />
                ))}
              </div>
            </div>
          ) : (
            // Password Input Section
            <IonItem style={{ marginTop: '20px' }}>
              <IonLabel position="floating">Password</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
              />
            </IonItem>
          )}

          {/* ========== ERROR MESSAGE DISPLAY ========== */}
          {/* Shows validation errors in red text */}
          {error && (
            <IonText color="danger">
              <p style={{ textAlign: 'center', marginTop: '10px' }}>
                {error}
              </p>
            </IonText>
          )}

          {/* ========== LOADING ANIMATION ========== */}
          {/* Three animated dots that run left-to-right during login */}
          {loading && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          )}

          {/* ========== SUCCESS MESSAGE DISPLAY ========== */}
          {/* Shows success feedback in green text with checkmark */}
          {success && (
            <IonText color="success">
              <p style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>
                ✓ {success}
              </p>
            </IonText>
          )}

          {/* ========== LOGIN BUTTON ========== */}
          {/* Main submit button - disabled during loading state */}
          <IonButton
            expand="block"
            style={{ marginTop: '20px' }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </IonButton>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;