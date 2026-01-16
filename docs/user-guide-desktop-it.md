# Percussion Studio - Guida Utente Desktop

Benvenuto in Percussion Studio! Questa guida copre tutte le funzionalità disponibili nella versione desktop.

---

## Indice

1. [Per Iniziare](#per-iniziare)
2. [Panoramica dell'Interfaccia](#panoramica-dellinterfaccia)
3. [Menu Hamburger](#menu-hamburger)
4. [Timeline e Sezioni](#timeline-e-sezioni)
5. [Editor Griglia](#editor-griglia)
6. [Gestione Tracce](#gestione-tracce)
7. [Gestione Misure](#gestione-misure)
8. [Controlli di Riproduzione](#controlli-di-riproduzione)
9. [Scorciatoie da Tastiera](#scorciatoie-da-tastiera)

---

## Per Iniziare

1. Apri `desktop.html` in un browser moderno (Chrome, Firefox, Edge consigliati)
2. Attendi il completamento della schermata di caricamento
3. Il ritmo predefinito verrà caricato automaticamente

---

## Panoramica dell'Interfaccia

L'interfaccia desktop è composta da quattro aree principali:

### Barra dell'Intestazione
- **Menu Hamburger (☰)**: Accedi alle operazioni sui file e alla guida utente
- **Titolo**: Mostra "Percussion Studio"
- **Info Ritmo**: Nome del ritmo corrente, sezione attiva, conteggio ripetizioni e BPM live
- **Slider BPM Globale**: Regola il tempo base (40-240 BPM)
- **Pulsante Count-In**: Attiva/disattiva il conteggio prima della riproduzione (mostra numero battiti: 4 o 6)
- **Pulsanti di Riproduzione**: Stop (■) e Play/Pausa (▶/❚❚)

### Pannello Timeline (Sinistra)
- Elenca tutte le sezioni del tuo ritmo
- Clicca su una sezione per selezionarla
- Trascina le sezioni per riordinarle

### Editor Griglia (Centro)
- L'area principale per visualizzare e modificare i pattern
- Griglia visuale che mostra tutte le tracce e i passi
- Il cursore evidenzia il passo corrente durante la riproduzione

### Tavolozza dei Colpi (In Basso)
- Seleziona diversi tipi di colpo da inserire nella griglia
- Pulsante Cancella per eliminare tutte le note nella sezione corrente

---

## Menu Hamburger

Clicca sull'icona **☰** in alto a sinistra per accedere a:

| Opzione | Descrizione |
|---------|-------------|
| **Nuovo Ritmo** | Crea un nuovo ritmo vuoto (richiede conferma) |
| **Carica Ritmo...** | Sfoglia e seleziona tra i ritmi disponibili |
| **Scarica Ritmo** | Salva il ritmo corrente come file YAML sul tuo computer |
| **Condividi Ritmo** | Copia un link condivisibile al ritmo corrente (solo per ritmi della libreria) |
| **Guida Utente** | Accedi a questa documentazione (scegli la lingua) |

### Caricamento Ritmi

1. Clicca su **Carica Ritmo...**
2. Sfoglia l'albero delle cartelle (clicca ▶ per espandere)
3. Clicca sul nome di un ritmo per caricarlo
4. In alternativa, clicca **Carica da PC** per selezionare un file `.yaml` locale

---

## Timeline e Sezioni

Il pannello timeline sulla sinistra gestisce la struttura del tuo ritmo.

### Informazioni Sezione

Ogni scheda sezione mostra:
- **Nome**: Identificatore della sezione
- **Tempo in Chiave**: 4/4 (binario), 6/8 (ternario), o 12/8
- **Passi**: Numero di passi nella griglia (es. 16s)
- **Ripetizioni**: Quante volte la sezione si ripete (es. x4)
- **Tempo**: BPM (ambra = personalizzato, grigio = globale)
- **Accelerazione**: Variazione del tempo per ripetizione (%)

### Azioni sulle Sezioni

| Azione | Come Fare |
|--------|-----------|
| **Seleziona Sezione** | Clicca sulla scheda della sezione |
| **Aggiungi Sezione** | Clicca il pulsante **+** nell'intestazione della timeline |
| **Duplica Sezione** | Passa sopra la sezione → Clicca l'icona copia |
| **Elimina Sezione** | Passa sopra la sezione → Clicca l'icona cestino |
| **Riordina Sezioni** | Trascina una sezione dalla sua maniglia (≡) e rilascia nella nuova posizione |
| **Rinomina Ritmo** | Clicca sul nome del ritmo in alto e digita |

---

## Editor Griglia

La griglia centrale è dove crei e modifichi i pattern.

### Barra Impostazioni Sezione

In cima alla griglia, configura la sezione corrente:

| Impostazione | Descrizione |
|--------------|-------------|
| **Nome** | Nome della sezione (campo di testo modificabile) |
| **Tempo in Chiave** | Binario (4/4), Ternario (6/8), o 12/8 |
| **Passi** | Numero di passi per misura (4-64) |
| **Ripetizioni** | Quante volte la sezione viene eseguita (1-99) |
| **Tempo** | L'icona lucchetto alterna BPM globale/personalizzato |
| **Accel/Decel %** | Variazione del tempo per ripetizione (-10% a +10%) |

### Inserimento dei Colpi

1. **Seleziona un colpo** dalla tavolozza in basso:
   - **Open** (O) - Tono aperto
   - **Slap** (S) - Colpo schiaffeggiato
   - **Bass** (B) - Tono basso
   - **Tip** (T) - Colpo con la punta delle dita
   - **Muff** (M) - Tono smorzato
   - **Rest** (-) - Silenzio (gomma)

2. **Clicca su qualsiasi cella** della griglia per inserire il colpo selezionato

3. **Clicca con il tasto destro** su una cella per cancellarla rapidamente

### Feedback Visivo

- **Celle attive**: Mostrano l'icona/lettera del colpo con colore
- **Passo corrente**: Evidenziato durante la riproduzione
- **Tracce mute**: Appaiono sbiadite con nome barrato
- **Colpi non validi**: Indicati quando il colpo non esiste per quello strumento

---

## Gestione Tracce

Ogni riga nella griglia rappresenta una traccia (strumento).

### Controlli Traccia

Situati nella colonna fissa a sinistra per ogni traccia:

| Controllo | Descrizione |
|-----------|-------------|
| **Nome** | Clicca per cambiare strumento/pacchetto suoni |
| **Mute (🔊/🔇)** | Attiva/disattiva l'audio per questa traccia |
| **Slider Volume** | Regola il volume della traccia (0-100%) |
| **Elimina (🗑)** | Rimuovi la traccia dal ritmo |

### Aggiunta Tracce

1. Clicca **+ Aggiungi Traccia** sotto l'ultima traccia
2. **Seleziona Strumento** dalla colonna sinistra
3. **Seleziona Pacchetto Suoni** dalla colonna destra
4. Clicca **OK** per confermare

### Cambio Strumenti

1. Clicca sul **nome della traccia** per aprire il modale strumenti
2. Scegli un nuovo strumento e pacchetto suoni
3. Clicca **OK** per applicare

> **Nota**: Le impostazioni di volume e mute sono globali — si applicano a tutte le istanze di quello strumento in tutte le sezioni.

---

## Gestione Misure

Le sezioni possono contenere più misure, permettendo pattern più complessi.

### Controlli Misura

Ogni misura ha un'intestazione con:

| Azione | Descrizione |
|--------|-------------|
| **Duplica (📄)** | Copia questa misura e inseriscila dopo |
| **Elimina (🗑)** | Rimuovi questa misura |

### Aggiunta Misure

- Clicca **+ Aggiungi Misura** in fondo alla griglia
- La nuova misura eredita le tracce dalle misure esistenti

---

## Controlli di Riproduzione

### Controlli nell'Intestazione

| Pulsante | Azione |
|----------|--------|
| **Stop (■)** | Ferma la riproduzione e resetta all'inizio |
| **Play (▶)** | Avvia la riproduzione dalla posizione corrente |
| **Pausa (❚❚)** | Mette in pausa alla posizione corrente |

### Controlli BPM

- **Slider BPM Globale**: Imposta il tempo base per tutte le sezioni
- **Override BPM Sezione**: L'icona lucchetto nelle impostazioni sezione per impostare un tempo personalizzato
- **Display BPM Live**: Mostra il tempo effettivo durante la riproduzione (riflette l'accelerazione)

### Contatore Ripetizioni

L'intestazione mostra:
- **Rep**: Ripetizione corrente / Ripetizioni totali
- Si aggiorna in tempo reale durante la riproduzione

### Count-In

Il pulsante **COUNT** nell'intestazione abilita un conteggio prima dell'avvio della riproduzione.

| Impostazione | Descrizione |
|--------------|-------------|
| **Attiva/Disattiva** | Clicca il pulsante COUNT per abilitare/disabilitare |
| **Battiti** | Impostato automaticamente a 4 (per tempo 4/4) o 6 (per tempo 6/8 o 12/8) |
| **Visivo** | Il pulsante mostra il battito corrente durante il count-in con animazione pulsante |
| **Audio** | Riproduce suoni click (tono più alto sul primo battito) |

> **Nota**: Il count-in viene riprodotto solo partendo dall'inizio (dopo lo stop). Riprendendo dalla pausa si salta il count-in.

---

## Scorciatoie da Tastiera

| Tasto | Azione |
|-------|--------|
| **Barra Spaziatrice** | Alterna Play/Pausa |
| **Invio** | Conferma modifica nome ritmo |

---

## Link Condivisibili

Puoi condividere e ricevere link diretti a ritmi specifici.

### Condividere un Ritmo

1. Apri il ritmo che vuoi condividere
2. Clicca **☰** → **Condividi Ritmo**
3. Il link viene copiato negli appunti
4. Invia il link a chiunque!

### Aprire un Link Condiviso

- Quando apri un link con `?rhythm=...`, quel ritmo si carica automaticamente
- Esempio: `desktop.html?rhythm=Batà/Dadà/dada_base`

> **Nota**: Condividi Ritmo è disponibile solo per ritmi della libreria. I ritmi caricati da file locali o creati nuovi non possono essere condivisi tramite URL.

---

## Suggerimenti e Buone Pratiche

1. **Usa le sezioni per la struttura del brano**: Crea sezioni separate per Intro, Strofa, Ritornello, ecc.

2. **Parti da ritmi esistenti**: Carica un ritmo simile a quello che vuoi, poi modificalo

3. **Scarica regolarmente**: Salva il tuo lavoro scaricando il file del ritmo

4. **Usa l'accelerazione del tempo**: Crea crescendo emozionanti con aumenti graduali del tempo

5. **Organizza con le misure**: Usa più misure per pattern di chiamata e risposta

---

*Buon divertimento con i tamburi! 🥁*
