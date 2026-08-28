import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@capacitor-community/speech-recognition'
import '@capacitor-community/text-to-speech'
createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
