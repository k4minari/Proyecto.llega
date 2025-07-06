// src/components/ChatbotWidget.jsx

import React, { useState } from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Configuración visual y mensajes iniciales del bot
const config = {
  botName: 'LlegaBot',
  initialMessages: [createChatBotMessage(`¡Hola! Soy LlegaBot. ¿En qué puedo ayudarte? Escribe "ayuda" para ver opciones.`)],
  customStyles: {
    botMessageBox: {
      backgroundColor: '#ff8c00',
    },
    chatButton: {
      backgroundColor: '#ff8c00',
    },
  },
};

// Componente que interpreta los mensajes del usuario
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
    else if (lowerCaseMessage.includes("ticket") || lowerCaseMessage.includes("admin") || lowerCaseMessage.includes("problema")) {
      actions.handleCreateTicket(message);
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
          return React.cloneElement(child, { parse: parse, actions });
        })}
      </div>
  );
};

// Componente que define todas las acciones que el bot puede realizar
const ActionProvider = ({ createChatBotMessage, setState, children }) => {
  const navigate = useNavigate();

  const addMessageToState = (botMessage) => {
    setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, botMessage],
    }));
  };

  const handleGreeting = () => addMessageToState(createChatBotMessage("¡Hola! Un placer ayudarte."));
  const handleModifyReservation = () => addMessageToState(createChatBotMessage("Puedes gestionar tus reservas en la sección 'Mis Reservas'."));
  const handleContactSupervisor = () => addMessageToState(createChatBotMessage("Encontrarás la información del supervisor en los detalles de cada espacio."));
  const handleHelp = () => addMessageToState(createChatBotMessage("Puedes pedirme cosas como: 'modificar mi reserva', 'ver mi perfil', o 'crear un ticket'."));
  const handleUnknown = () => addMessageToState(createChatBotMessage("Lo siento, no te he entendido. Prueba a escribir 'ayuda'."));

  const handleModifyProfile = () => {
    addMessageToState(createChatBotMessage("¡Claro! Te llevo a tu perfil para que lo modifiques."));
    navigate('/profile');
  };

  const handleCreateTicket = async (userMessage) => {
    const botMessage = createChatBotMessage("Entendido. Estoy creando un ticket con tu mensaje. Un administrador se pondrá en contacto pronto.");
    addMessageToState(botMessage);

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Crea un nuevo documento en la colección "tickets" de Firestore
        await addDoc(collection(db, "tickets"), {
          userId: currentUser.uid,
          userEmail: currentUser.email,
          message: userMessage,
          status: "abierto",
          createdAt: serverTimestamp(),
        });
      } else {
        addMessageToState(createChatBotMessage("Error: Debes estar autenticado para crear un ticket."));
      }
    } catch (error) {
      console.error("Error al crear el ticket: ", error);
      addMessageToState(createChatBotMessage("Lo siento, hubo un problema al crear tu ticket."));
    }
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
              handleCreateTicket,
              handleHelp,
              handleUnknown,
            },
          });
        })}
      </div>
  );
};

// El componente principal del Widget que se exporta
const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
      <div className="chatbot-wrapper">
        {isOpen ? (
            <div className="chatbot-container">
              <button className="close-button" onClick={toggleChatbot}>
                ✖
              </button>
              <Chatbot config={config} messageParser={MessageParser} actionProvider={ActionProvider} />
            </div>
        ) : (
            <button className="open-button" onClick={toggleChatbot}>
              💬
            </button>
        )}
      </div>
  );
};

// Función helper para crear los objetos de mensaje del bot
function createChatBotMessage(message, options) {
  return { message, type: 'bot', ...options };
}

export default ChatbotWidget;