# Percussion Studio - Guida Utente Desktop

Benvenuto in Percussion Studio! Questa guida copre tutte le funzionalità disponibili nella versione desktop.

---

## Indice

1. [Per Iniziare](#per-iniziare)
2. [Panoramica Interfaccia](#panoramica-interfaccia)
3. [Menu Navigazione](#menu-navigazione)
4. [Timeline e Sezioni](#timeline-e-sezioni)
5. [Editor Griglia](#editor-griglia)
6. [Gestione Tracce](#gestione-tracce)
7. [Gestione Misure](#gestione-misure)
8. [Controlli Riproduzione](#controlli-riproduzione)
9. [Scorciatoie da Tastiera](#scorciatoie-da-tastiera)

---

## Per Iniziare

1. Apri `desktop.html` in un browser moderno (Chrome, Firefox, Edge consigliati)
2. Attendi il completamento della schermata di caricamento
3. Il ritmo predefinito verrà caricato automaticamente

---

## Panoramica Interfaccia

L'interfaccia desktop è composta da quattro aree principali:

### Barra Intestazione
- **Menu Hamburger (☰)**: Accesso alle operazioni sui file e alla guida
- **Titolo**: Mostra "Percussion Studio"
- **Info Ritmo**: Nome del ritmo corrente, sezione attiva, conteggio ripetizioni e BPM live
- **Slider BPM Globale**: Regola il tempo base (40-240 BPM) con lo slider visivo
- **Pulsante Count-In**: Attiva/Disattiva il conteggio iniziale (mostra 4 o 6 battiti)
- **Pulsanti Riproduzione**: Stop (■) e Play/Pausa (▶/❚❚)

### Pannello Timeline (Sinistra)
- Elenca tutte le sezioni del tuo ritmo
- Clicca una sezione per passarci
- Trascina le sezioni per riordinarle

### Editor Griglia (Centro)
- L'area principale per visualizzare e modificare i pattern
- Griglia visiva che mostra tutte le tracce e gli step
- La testina di riproduzione evidenzia lo step corrente durante l'ascolto

### Tavolozza Colpi (Basso)
- Seleziona diversi tipi di colpo da "dipingere" nella griglia
- Pulsante Pulisci per cancellare tutte le note nella sezione corrente

---

## Menu Navigazione

Clicca l'icona **☰** in alto a sinistra per accedere a:

| Opzione | Descrizione |
|---------|-------------|
| **Nuovo Ritmo** | Crea un nuovo ritmo vuoto (richiede conferma) |
| **Carica Ritmo...** | Sfoglia e seleziona dai ritmi disponibili (inclusi i ritmi Batà) |
| **Scarica Ritmo** | Salva il ritmo corrente come file YAML sul tuo computer |
| **Condividi Ritmo** | Copia un link condivisibile al ritmo corrente (solo per ritmi della libreria) |
| **Guida Utente** | Accedi a questa documentazione (scegli la lingua) |

### Caricamento Ritmi (Libreria e Batà)

1. Clicca **Carica Ritmo...** per aprire il browser.
2. Naviga nell'albero delle cartelle (clicca ▶ per espandere cartelle come "Batà").
3. Clicca sul nome di un ritmo per caricarlo.
4. **File Locali**: Clicca **Carica da PC** per aprire un file `.yaml` dal tuo computer.

---

## Timeline e Sezioni

Il pannello timeline a sinistra gestisce la struttura del tuo ritmo.

### Informazioni Sezione

Ogni scheda sezione mostra:
- **Nome**: Identificativo della sezione
- **Metro**: Armatura e Step (es: 4/4 (16))
- **Ripetizioni**: Quante volte si ripete questa sezione (es: x4)
- **Tempo**: BPM (ambra = personalizzato, grigio = globale)
- **Accelerazione**: Cambio di tempo per ripetizione (%)

### Azioni Sezione

| Azione | Come Fare |
|--------|-----------|
| **Seleziona Sezione** | Clicca sulla scheda della sezione |
| **Aggiungi Sezione** | Clicca il pulsante **+** nell'intestazione timeline |
| **Duplica Sezione** | Passa sopra la sezione → Clicca l'icona copia |
| **Elimina Sezione** | Passa sopra la sezione → Clicca l'icona cestino |
| **Riordina Sezioni** | Trascina una sezione dalla maniglia (≡) in una nuova posizione |
| **Rinomina Ritmo** | Clicca il nome del ritmo in alto e digita |

---

## Editor Griglia

La griglia centrale è dove crei e modifichi i pattern.

### Barra Impostazioni Sezione

In cima alla griglia, configura la sezione corrente:

| Impostazione | Descrizione |
|--------------|-------------|
| **Nome** | Nome della sezione (testo modificabile) |
| **Metro** | Combinazione di Armatura e Step (es: "4/4 (16)") |
| **Ripetizioni** | Quante volte suona la sezione (1-99) |
| **Tempo** | L'icona lucchetto commuta tra BPM globale/personalizzato |
| **Accel/Decel %** | Cambio di tempo per ripetizione (da -10% a +10%) |

### Inserimento Colpi

1. **Seleziona un colpo** dalla tavolozza in basso:
   - **Open** (O) - Tono aperto
   - **Slap** (S) - Colpo secco
   - **Bass** (B) - Tono basso
   - **Tip** (T) - Tocco/punta
   - **Muff** (M) - Tono smorzato
   - **Rest** (-) - Pausa (gomma)

2. **Clicca qualsiasi cella** per inserire il colpo selezionato

3. **Clicca col tasto destro** su una cella per cancellarla rapidamente

### Feedback Visivo

- **Celle attive**: Mostrano l'icona/lettera del colpo con colore
- **Step corrente**: Evidenziato durante la riproduzione
- **Tracce mute**: Appaiono attenuate con il nome barrato
- **Colpi non validi**: Indicato se il colpo non esiste per quello strumento

---

## Gestione Tracce

Ogni riga nella griglia rappresenta una traccia (strumento).

### Controlli Traccia

Situati nella colonna fissa a sinistra per ogni traccia:

| Controllo | Descrizione |
|-----------|-------------|
| **Nome** | Clicca (il testo) per aprire la **Modale Cambio Strumento** |
| **Muto (🔊/🔇)** | Attiva/Disattiva audio per questa traccia |
| **Slider Volume** | Regola il volume della traccia (0-100%) |
| **Elimina (🗑)** | Rimuove la traccia dal ritmo |

### Aggiungere Tracce

1. Clicca **+ Aggiungi Traccia** sotto l'ultima traccia in una misura.
2. Seleziona Strumento e Pacchetto Suoni.
3. Clicca **OK** per confermare.

### Modale Cambio Strumento

1. Clicca sul **nome traccia** (o l'etichetta strumento) sul lato sinistro.
2. Si aprirà una modale che ti permette di scegliere un diverso **Strumento** (es: Conga, Itotele) o **Pacchetto Suoni**.
3. Clicca **OK** per applicare le modifiche.

> **Nota**: Le impostazioni di volume e muto sono globali — si applicano a tutte le istanze di quello strumento in tutte le sezioni.

---

## Gestione Misure

Le sezioni possono contenere multiple misure, permettendo pattern più complessi.

### Controlli Misura

Ogni intestazione di misura permette di:
- **Duplicare**: Copia il pattern in una nuova misura successiva.
- **Eliminare**: Rimuove la misura.

### Aggiungere Misure

- Clicca **+ Aggiungi Misura** in fondo alla griglia
- La nuova misura eredita le tracce dalle misure esistenti

---

## Controlli Riproduzione

### Controlli Intestazione

| Pulsante | Azione |
|----------|--------|
| **Stop (■)** | Ferma la riproduzione e resetta all'inizio |
| **Play (▶)** | Avvia la riproduzione dalla posizione corrente |
| **Pausa (❚❚)** | Mette in pausa alla posizione corrente |

### Controlli BPM

- **Slider BPM Globale**: Lo slider principale nell'intestazione imposta il tempo base.
- **BPM Sezione**: Usa l'icona lucchetto nelle impostazioni sezione per impostare un tempo personalizzato.
- **Display BPM Live**: Mostra il tempo attuale durante la riproduzione (riflette l'accelerazione).

### Contatore Ripetizioni

L'intestazione mostra:
- **Rep**: Ripetizione corrente / Ripetizioni totali
- Si aggiorna in tempo reale durante la riproduzione

### Count-In (Conteggio Iniziale)

Il pulsante **COUNT** nell'intestazione abilita un conteggio prima dell'avvio.

| Impostazione | Descrizione |
|--------------|-------------|
| **Attiva** | Clicca il pulsante COUNT per abilitare/disabilitare |
| **Battiti** | Impostato automaticamente a 4 (per tempi 4/4) o 6 (per 6/8 o 12/8) |
| **Visivo** | Il pulsante mostra il battito corrente con un'animazione |
| **Audio** | Riproduce un click (accento più acuto sul battito 1) |

> **Nota**: Il Count-in suona solo quando si avvia dall'inizio (dopo Stop). Riprendere dalla pausa salta il conteggio.

---

## Scorciatoie da Tastiera

| Tasto | Azione |
|-------|--------|
| **Barra Spaziatrice** | Play/Pausa |
| **Invio** | Conferma modifica nome ritmo |

---

## Condividere Link

Puoi condividere e ricevere link diretti a specifici ritmi.

### Condividere un Ritmo

1. Apri il ritmo che vuoi condividere.
2. Clicca **☰** → **Condividi Ritmo**.
3. Il link viene copiato negli appunti.
4. Invia il link a chi vuoi!

> **Nota**: "Condividi Ritmo" è disponibile solo per i ritmi della libreria (repository GitHub). I ritmi caricati da file locali o nuovi non possono essere condivisi via URL.

---

## Suggerimenti

1. **Usa le sezioni per la struttura**: Crea sezioni separate per Intro, Verso, Ritornello, ecc.

2. **Parti da ritmi esistenti**: Carica un ritmo simile a quello che vuoi, poi modificalo.

3. **Scarica regolarmente**: Salva il tuo lavoro scaricando il file del ritmo.

4. **Usa l'accelerazione**: Crea crescendo emozionanti con aumenti graduali di tempo.

5. **Organizza con le misure**: Usa misure multiple per pattern di "chiamata e risposta".

---

*Buon drumming! 🥁*
