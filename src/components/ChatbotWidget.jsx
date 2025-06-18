// src/components/ChatbotWidget.jsx

import React from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import { useNavigate } from 'react-router-dom';

const config = {
  botName: 'LlegaBot',
  initialMessages: [createChatBotMessage(`¡Hola! Soy LlegaBot. ¿En qué puedo ayudarte? Escribe "ayuda" para ver opciones.`)],
  // Puedes personalizar los colores y estilos aquí
  customStyles: {
    botMessageBox: {
      backgroundColor: '#ff8c00',
    },
    chatButton: {
      backgroundColor: '#ff8c00',
    },
  },
};

// --- EL NUEVO CEREBRO DEL BOT ---
const MessageParser = ({ children, actions }) => {
  const parse = (message) => {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes("hola") || lowerCaseMessage.includes("buenas")) {
      actions.handleGreeting();
    } 
    else if (lowerCaseMessage.includes("reserva") || lowerCaseMessage.includes("modificar")) {
      actions.handleModifyReservation();
    } 
    else if (lowerCaseMessage.includes("supervisor") || lowerCaseMessage.includes("contacto")) {
      actions.handleContactSupervisor();
    }
    else if (lowerCaseMessage.includes("perfil")) {
      actions.handleModifyProfile();
    }
    else if (lowerCaseMessage.includes("ayuda")) {
      actions.handleHelp();
    }
    else {
      actions.handleUnknown();
    }
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          parse: parse,
          actions,
        });
      })}
    </div>
  );
};

// --- AQUÍ DEFINIMOS QUÉ HACE EL BOT ---
const ActionProvider = ({ createChatBotMessage, setState, children }) => {
  const navigate = useNavigate();

  const addMessageToState = (botMessage) => {
    setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, botMessage],
    }));
  };

  const handleGreeting = () => {
    const botMessage = createChatBotMessage("¡Hola! Un placer ayudarte.");
    addMessageToState(botMessage);
  };

  const handleModifyReservation = () => {
    const botMessage = createChatBotMessage("Para modificar una reserva, ve a la sección 'Mis Reservas'. Te puedo llevar si quieres.");
    addMessageToState(botMessage);
    // Podrías añadir lógica para que un clic en un botón lo redirija
    // navigate('/my-reservations');
  };
  
  const handleContactSupervisor = () => {
    const botMessage = createChatBotMessage("Puedes encontrar la información de contacto del supervisor en los detalles de cada espacio.");
    addMessageToState(botMessage);
  };

  const handleModifyProfile = () => {
    const botMessage = createChatBotMessage("¡Claro! Te llevo a tu perfil para que lo modifiques.");
    addMessageToState(botMessage);
    navigate('/profile'); // Redirigimos al usuario
  };

  const handleHelp = () => {
    const botMessage = createChatBotMessage(
      "Puedes pedirme cosas como: 'modificar mi reserva', 'ver mi perfil', o 'contactar al supervisor'."
    );
    addMessageToState(botMessage);
  };

  const handleUnknown = () => {
    const botMessage = createChatBotMessage("Lo siento, no te he entendido. Prueba a escribir 'ayuda' para ver qué puedo hacer.");
    addMessageToState(botMessage);
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: {
            handleGreeting,
            handleModifyReservation,
            handleContactSupervisor,
            handleModifyProfile,
            handleHelp,
            handleUnknown,
          },
        });
      })}
    </div>
  );
};

// --- EL COMPONENTE FINAL ---
const ChatbotWidget = () => {
  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <Chatbot
        config={config}
        messageParser={MessageParser}
        actionProvider={ActionProvider}
      />
    </div>
  );
};

// Función helper para crear mensajes de bot
function createChatBotMessage(message, options) {
    return {
      message,
      type: 'bot',
      ...options,
    };
}

export default ChatbotWidget;