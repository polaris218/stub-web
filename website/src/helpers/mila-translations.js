export const JOURNAL_MESSAGES = [
  {
    'type' : 'NOTSTARTED',
    'message' : {
      'EN' : 'Booking confirmed',
      'DE' : 'Buchung bestätigt',
      'FR' : 'Réservation confirmée',
      'IT' : 'Prenotazione confermata'
    }
  },
  {
    'type' : 'CREW_ASSIGNED',
    'message' : {
      'EN' : 'Service Provider found',
      'DE' : 'Service-Partner gefunden',
      'FR' : 'Prestataire de service trouvé',
      'IT' : 'Partner di assistenza trovato'
    }
  },
  {
    'type' : 'ENROUTE',
    'message' : {
      'EN' : 'Service Provider on the way',
      'DE' : 'Service-Partner ist unterwegs',
      'FR' : 'Le prestataire de service est en route',
      'IT' : 'Il partner di assistenza è in viaggio'
    }
  },
  {
    'type' : 'STARTED',
    'message' : {
      'EN' : 'Service in progress',
      'DE' : 'Service in Ausführung',
      'FR' : 'Service en cours',
      'IT' : 'Servizio in corso di realizzazione'
    }
  },
  {
    'type' : 'AUTO_START',
    'message' : {
      'EN' : 'Service in progress',
      'DE' : 'Service in Ausführung',
      'FR' : 'Service en cours',
      'IT' : 'Servizio in corso di realizzazione'
    }
  },
  {
    'type' : 'COMPLETE',
    'message' : {
      'EN' : 'Service completed',
      'DE' : 'Service beendet',
      'FR' : 'Service terminé',
      'IT' : 'Servizio terminato'
    }
  },
  {
    'type' : 'AUTO_COMPLETE',
    'message' : {
      'EN' : 'Service completed',
      'DE' : 'Service beendet',
      'FR' : 'Service terminé',
      'IT' : 'Servizio terminato'
    }
  },
  {
    'type' : 'CANCELLED',
    'message' : {
      'EN' : 'Service terminated',
      'DE' : 'Service abgebrochen',
      'FR' : 'Service annulé',
      'IT' : 'Servizio annullato'
    }
  },
  {
    'type' : 'EXCEPTION',
    'message' : {
      'EN' : 'Uncompleted service',
      'DE' : 'Service nicht abgeschlossen',
      'FR' : 'Service non finalisé',
      'IT' : 'Servizio non completato'
    }
  },
  {
    'type' : 'CUSTOMER_EXCEPTION',
    'message' : {
      'EN' : 'Customer not available',
      'DE' : 'Kunde nicht erreichbar',
      'FR' : 'Client non disponible',
      'IT' : 'Cliente non raggiungibile'
    }
  }
];

export const BILLING_MESSAGES = {
  'EN' : 'Billing',
  'DE' : 'Rechnungsstellung',
  'FR' : 'Facturation',
  'IT' : 'Fatturazione'
};

export const CUSTOMER_NOT_AVAILABLE_MESSAGES = {
  'EN' : 'Customer not available',
  'DE' : 'Kunde nicht erreichbar',
  'FR' : 'Client non disponible',
  'IT' : 'Cliente non raggiungibile'
};

export const ESTIMATE_MESSAGES = {
  'ENROUTE' : {
    'EN' : {
      primary: 'Arrival of your Service Provider',
      secondary: ''
    },
    'DE' : {
      primary: 'Ankunft Ihres Service-Partners',
      secondary: ''
    },
    'FR' : {
      primary: 'Arrivée de votre prestataire de service',
      secondary: ''
    },
    'IT' : {
      primary: 'Arrivo del vostro partner di assistenza',
      secondary: ''
    }
  },
  'STARTED' : {
    'EN' : {
      primary: 'Service in progress',
      secondary: 'now'
    },
    'DE' : {
      primary: 'Service in Ausführung',
      secondary: 'jetzt'
    },
    'FR' : {
      primary: 'Service en cours',
      secondary: 'actuellement'
    },
    'IT' : {
      primary: 'Servizio in corso di realizzazione',
      secondary: 'attualmente'
    }
  },
  'AUTO_START' : {
    'EN' : {
      primary: 'Service in progress',
      secondary: 'now'
    },
    'DE' : {
      primary: 'Service in Ausführung',
      secondary: 'jetzt'
    },
    'FR' : {
      primary: 'Service en cours',
      secondary: 'actuellement'
    },
    'IT' : {
      primary: 'Servizio in corso di realizzazione',
      secondary: 'attualmente'
    }
  },
  'AUTO_COMPLETE' : {
    'EN' : {
      primary: 'Service completed',
      secondary: 'now'
    },
    'DE' : {
      primary: 'Service beendet',
      secondary: 'jetzt'
    },
    'FR' : {
      primary: 'Service terminé',
      secondary: 'actuellement'
    },
    'IT' : {
      primary: 'Servizio terminato',
      secondary: 'attualmente'
    }
  },
  'COMPLETE' : {
    'EN' : {
      primary: 'Service completed',
      secondary: 'now'
    },
    'DE' : {
      primary: 'Service beendet',
      secondary: 'jetzt'
    },
    'FR' : {
      primary: 'Service terminé',
      secondary: 'actuellement'
    },
    'IT' : {
      primary: 'Servizio terminato',
      secondary: 'attualmente'
    }
  },
  'CANCELLED' : {
    'EN' : {
      primary: 'Service terminated',
      secondary: 'now'
    },
    'DE' : {
      primary: 'Service abgebrochen',
      secondary: 'jetzt'
    },
    'FR' : {
      primary: 'Service annulé',
      secondary: 'actuellement'
    },
    'IT' : {
      primary: 'Servizio annullato',
      secondary: 'attualmente'
    }
  },
  'CUSTOMER_EXCEPTION' : {
    'EN' : {
      primary: 'Customer not available',
      secondary: 'now'
    },
    'DE' : {
      primary: 'Kunde nicht erreichbar',
      secondary: 'jetzt'
    },
    'FR' : {
      primary: 'Client non disponible',
      secondary: 'actuellement'
    },
    'IT' : {
      primary: 'Cliente non raggiungibile',
      secondary: 'attualmente'
    }
  },
  'EXCEPTION' : {
    'EN' : {
      primary: 'Service terminated',
      secondary: 'now'
    },
    'DE' : {
      primary: 'Service abgebrochen',
      secondary: 'jetzt'
    },
    'FR' : {
      primary: 'Service annulé',
      secondary: 'actuellement'
    },
    'IT' : {
      primary: 'Servizio annullato',
      secondary: 'attualmente'
    }
  },
  'ARRIVALDATETIME' : {
    'EN' : {
      primary: 'Arrival of your Service Provider',
      secondary: ''
    },
    'DE' : {
      primary: 'Ankunft Ihres Service-Partners',
      secondary: ''
    },
    'FR' : {
      primary: 'Arrivée de votre prestataire de service',
      secondary: ''
    },
    'IT' : {
      primary: 'Arrivo del vostro partner di assistenza',
      secondary: ''
    }
  }
};

export const UI_MESSAGES = {
  'EN' : {
    'modal_title' : 'Send messages and files',
    'placeholder' : 'Type your message here ...',
    'file_attachment_placeholder' : 'Click here to attach or drop files',
    'send_button' : 'send',
    'cancel_button' : 'cancel',
    'mobile_select' : 'Select files to upload',
    'mobile_no_files' : 'No files chosen'
  },
  'DE' : {
    'modal_title' : 'Nachrichten und Dateien senden',
    'placeholder' : 'Verfassen Sie Ihre Nachricht hier ...',
    'file_attachment_placeholder' : 'Klicken Sie hier um Dateien anzuhängen oder legen Sie sie in diesem Feld ab',
    'send_button' : 'senden',
    'cancel_button' : 'abbrechen',
    'mobile_select' : 'Dateien zum Hochladen auswählen',
    'mobile_no_files' : 'Keine Dateien ausgewählt'
  },
  'FR' : {
    'modal_title' : 'Envoyer des messages et des fichiers',
    'placeholder' : 'Tapez votre message ici...',
    'file_attachment_placeholder' : 'Cliquez ici pour joindre ou glisser-déposer des fichiers',
    'send_button' : 'envoyer',
    'cancel_button' : 'annuler',
    'mobile_select' : 'Sélectionner les fichiers à télécharger',
    'mobile_no_files' : 'Aucun fichier sélectionné'
  },
  'IT' : {
    'modal_title' : 'Inviare messaggi e file',
    'placeholder' : 'Digiti qui il suo messaggio....',
    'file_attachment_placeholder' : 'Cliccare qui per allegare il file o trascinarlo e rilasciarlo',
    'send_button' : 'inviare',
    'cancel_button' : 'cancellare',
    'mobile_select' : 'Selezionare i file da caricare',
    'mobile_no_files' : 'Nessun file selezionato'
  }
};

export const ADDNOTE_ERROR_MESSAGES = {
  'EN' : {
    'server_error' : 'Something went wrong. Please reach out to us.',
    'empty_note' : 'Message can not be empty.',
    'error_modal_title' : 'Adding a message',
  },
  'DE' : {
    'server_error' : 'Da ist etwas schief gelaufen. Bitte kontaktieren Sie uns.',
    'empty_note' : 'Nachricht kann nicht leer sein.',
    'error_modal_title' : 'Nachricht hinzufügen',
  },
  'FR' : {
    'server_error' : 'Oups, quelque chose n\'a pas fonctionné. Veuillez nous contacter.',
    'empty_note' : 'Le message ne peut pas être vide.',
    'error_modal_title' : 'Ajouter un message',
  },
  'IT' : {
    'server_error' : 'Qualcosa è andato storto. La preghiamo di contattarci.',
    'empty_note' : 'Il messaggio non può rimanere vuoto.',
    'error_modal_title' : 'Aggiunta di un messaggio',
  }
};

export const TASK_WITH_NO_DATETIME_MESSAGE = {
  'EN' : 'Appointment: to be determined',
  'DE' : 'Termin: noch zu vereinbaren',
  'FR' : 'Rendez-vous : à définir',
  'IT' : 'Appuntamento: da definire'
};
