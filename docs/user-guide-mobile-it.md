# Percussion Studio - Guida Utente Mobile

Percussion Studio Mobile è ottimizzato per **ascolto e pratica**. Sebbene condivida il motore principale con la versione desktop, l'interfaccia è semplificata per piccoli schermi touch.

> **Importante**: Questa applicazione richiede la **Modalità Orizzontale (Landscape)** sui dispositivi mobili.

---

## Indice

1. [Per Iniziare](#per-iniziare)
2. [Interfaccia Mobile](#interfaccia-mobile)
3. [Menu Navigazione](#menu-navigazione)
4. [Controlli Riproduzione](#controlli-riproduzione)
5. [La Vista Griglia](#la-vista-griglia)
6. [Differenze dal Desktop](#differenze-dal-desktop)

---

## Per Iniziare

1. Apri `mobile.html` sul tuo dispositivo mobile.
2. **Ruota il dispositivo in Orizzontale**. L'app ti chiederà di ruotare se sei in verticale.
3. Tocca "Schermo Intero" (opzionale ma consigliato).

---

## Interfaccia Mobile

L'interfaccia mobile è progettata per massimizzare la visibilità della griglia.

### Barra Intestazione (Alto)
- **Menu (☰)**: Apre il menu di navigazione.
- **Nome Ritmo**: Mostra il titolo del ritmo corrente.
- **Slider BPM**: Controllo globale del tempo.
- **Controlli Riproduzione**: Pulsanti Conteggio, Stop e Play.

### Griglia Principale (Centro)
- Mostra il pattern ritmico.
- Calcola automaticamente la dimensione delle celle per adattarsi allo schermo.
- Scorrimento automatico durante la riproduzione per seguire il battito.

---

## Menu Navigazione

Tocca l'icona **☰** per accedere a:

| Opzione | Descrizione |
|---------|-------------|
| **Carica Ritmo** | Sfoglia e seleziona i ritmi |
| **Mostra Struttura** | Vedi/Salta alle sezioni (Intro, Verso, ecc.) |
| **Guida Utente** | Vedi questa guida |
| **Chiudi Menu** | Torna alla griglia |

> **Nota**: Per risparmiare spazio, "Mostra Struttura" apre un pannello per vedere la forma del brano, invece di mostrare sempre la timeline come su desktop.

---

## Controlli Riproduzione

Situati in alto a destra nell'intestazione:

- **Slider BPM**: Trascina per cambiare la velocità generale.
- **Count (4/6)**: Attiva un conteggio di 1 misura prima dell'avvio.
- **Stop (■)**: Resetta all'inizio.
- **Play (▶)**: Avvia la riproduzione.

---

## La Vista Griglia

La griglia è "funzionale", progettata per la lettura e l'accompagnamento:
- **Niente Zoom**: La griglia si ridimensiona automaticamente per adattarsi perfettamente alla larghezza dello schermo.
- **Auto-Scroll**: La vista segue la testina di riproduzione per non farti perdere il segno.
- **Intestazioni Sezione**: Mostrano il nome della sezione corrente e le ripetizioni.

---

## Differenze dal Desktop

| Caratteristica | Desktop | Mobile |
|----------------|---------|--------|
| **Modifica** | Creazione/Modifica completa | Sola lettura (Riproduzione) |
| **Timeline** | Sempre visibile (Sinistra) | Nascosta (Usa "Mostra Struttura") |
| **Griglia** | Modificabile, scorrevole | Auto-adattante, Sola lettura |
| **Pacchetti Suoni** | Configurabili | Fissi al default del ritmo caricato |

*Consiglio: Usa la versione Desktop per scrivere i tuoi ritmi, poi usa il Mobile per praticarli ovunque!*

### Condividi Ritmo

- Tocca **Condividi Ritmo** per copiare un link al ritmo corrente
- Su mobile, potrebbe aprire il menu di condivisione del dispositivo
- Disponibile solo per ritmi della libreria (non per file caricati localmente)

### Guida Utente

- Tocca **Guida Utente** per accedere alla documentazione
- Scegli la lingua preferita (Italiano o Inglese)

---

## Visualizzazione dei Ritmi

La versione mobile visualizza i ritmi in una griglia in sola lettura.

### Capire la Griglia

- Ogni **riga** rappresenta una traccia strumento
- Ogni **colonna** rappresenta un passo temporale
- Le **celle piene** mostrano colpi attivi con icone/lettere
- Le **celle vuote** indicano pause (silenzio)
- I **separatori** dividono i passi in gruppi basati sulla suddivisione

### Numeri dei Passi

- I numeri sopra la griglia indicano le posizioni dei passi (1, 2, 3...)
- I gruppi aiutano a vedere la struttura del beat (es. gruppi di 4 per tempo 4/4)

### Posizione Corrente

- Durante la riproduzione, il **passo corrente** è evidenziato
- La griglia scorre automaticamente per mantenere visibile il cursore

---

## Controlli delle Tracce

Ogni traccia ha controlli nella colonna sinistra.

### Slider Volume

- Trascina sinistra/destra per regolare il volume (0-100%)
- Volume a 0 muta effettivamente la traccia
- Le modifiche si applicano globalmente a tutte le occorrenze di quello strumento

### Pulsante Mute

- Tocca l'**icona altoparlante** (🔊) per mutare
- Tocca di nuovo (🔇) per riattivare
- Le tracce mutate appaiono sbiadite con nomi barrati

> **Nota**: Le impostazioni di volume e mute non vengono salvate — si resettano caricando un nuovo ritmo.

---

## Controlli di Riproduzione

### Pulsanti di Controllo

Situati nell'intestazione sul lato destro:

| Pulsante | Descrizione |
|----------|-------------|
| **Stop (■)** | Ferma la riproduzione e resetta all'inizio |
| **Play (▶)** | Avvia la riproduzione dalla posizione corrente |
| **Pausa (❚❚)** | Mette in pausa alla posizione corrente |

### BPM Globale

- Usa lo slider accanto ai pulsanti per regolare il tempo
- Intervallo: 40-240 BPM
- Mostra il valore BPM corrente sopra lo slider

### Display BPM Live

- Mostra il tempo effettivo durante la riproduzione
- Riflette qualsiasi accelerazione/decelerazione del tempo
- **Grigio** quando fermo (mostra BPM globale)
- **Verde** quando in riproduzione (mostra tempo live)

### Contatore Ripetizioni

- **Rep X/Y** mostra la ripetizione corrente sul totale
- Si aggiorna in tempo reale durante la riproduzione

### Count-In

Il pulsante **CNT** nell'intestazione abilita un conteggio prima dell'avvio della riproduzione.

- **Attiva/Disattiva**: Tocca il pulsante CNT per abilitare/disabilitare
- **Battiti**: Impostato automaticamente a 4 (tempo 4/4) o 6 (tempo 6/8 o 12/8)
- **Visivo**: Il pulsante mostra il battito corrente durante il count-in con animazione pulsante
- **Audio**: Riproduce suoni click prima dell'avvio del ritmo

> **Nota**: Il count-in viene riprodotto solo partendo dall'inizio.

---

## Navigazione delle Sezioni

### Tramite Modale Struttura

1. Tocca **☰** → **Mostra Struttura**
2. Visualizza tutte le sezioni con le loro proprietà:
   - Nome
   - Metro
   - Ripetizioni
   - Impostazioni tempo
3. Tocca una scheda sezione per passare ad essa

### Durante la Riproduzione

- L'app segue l'ordine naturale delle sezioni
- Le sezioni si ripetono secondo il loro conteggio ripetizioni
- Quando una sezione termina, la riproduzione passa alla successiva

---

## Suggerimenti per l'Uso Mobile

1. **Usa la modalità paesaggio**: La griglia è ottimizzata per la visualizzazione orizzontale

2. **Regola il volume per traccia**: Usa gli slider individuali per bilanciare il mix

3. **Muta le tracce per concentrarti**: Muta temporaneamente le tracce per praticare parti specifiche

4. **Controlla la struttura**: Usa "Mostra Struttura" per vedere il layout completo del ritmo

5. **Regola il BPM per esercitarti**: Rallenta i ritmi complessi per l'apprendimento

---

## Differenze dal Desktop

| Funzionalità | Desktop | Mobile |
|--------------|---------|--------|
| Modifica Griglia | ✅ Sì | ❌ Solo Visualizzazione |
| Aggiungi/Rimuovi Tracce | ✅ Sì | ❌ No |
| Aggiungi/Rimuovi Sezioni | ✅ Sì | ❌ No |
| Impostazioni Sezione | ✅ Complete | ❌ Solo Visualizzazione |
| Scarica Ritmo | ✅ Sì | ❌ No |
| Carica da PC | ✅ Sì | ❌ No |
| Volume/Mute | ✅ Sì | ✅ Sì |
| Riproduzione | ✅ Sì | ✅ Sì |
| Regolazione BPM | ✅ Sì | ✅ Sì |

| Condividi Ritmo | ✅ Sì | ✅ Sì |

---

## Link Condivisibili

Puoi condividere e ricevere link diretti a ritmi specifici.

### Condividere un Ritmo

1. Apri il ritmo che vuoi condividere
2. Tocca **☰** → **Condividi Ritmo**
3. Si apre il menu di condivisione del dispositivo (o il link viene copiato)
4. Invia il link a chiunque!

### Aprire un Link Condiviso

- Quando apri un link con `?rhythm=...`, quel ritmo si carica automaticamente
- Esempio: `mobile.html?rhythm=Batà/Dadà/dada_base`

> **Nota**: Condividi Ritmo è disponibile solo per ritmi della libreria.

---

*Goditi i tuoi ritmi ovunque! 🥁*
