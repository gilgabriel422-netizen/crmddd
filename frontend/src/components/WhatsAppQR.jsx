import React, { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

const WhatsAppQR = () => {
  const canvasRef = useRef(null)
  const whatsappNumber = '593999222210'
  const whatsappMessage = '¡Hola! Me gustaría obtener información sobre sus paquetes turísticos.'
  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  useEffect(() => {
    const generateQR = async () => {
      try {
        const canvas = canvasRef.current
        if (canvas) {
          await QRCode.toCanvas(canvas, whatsappURL, {
            width: 200,
            margin: 2,
            color: {
              dark: '#1e3a8a', // Navy color
              light: '#ffffff'
            }
          })
        }
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    generateQR()
  }, [])


  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Tienes alguna queja
        </h3>
      </div>

      {/* QR Code */}
      <div className="mb-6">
        <canvas 
          ref={canvasRef}
          className="mx-auto border-4 border-gray-200 rounded-lg"
        />
      </div>
    </div>
  )
}

export default WhatsAppQR
