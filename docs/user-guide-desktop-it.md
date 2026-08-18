# Percussion Studio - Guida Utente Desktop

Benvenuto in Percussion Studio! Questa guida copre tutte le funzionalità disponibili nella versione desktop.

---

## Indice

1. [Per Iniziare](#per-iniziare)
2. [Panoramica Interfaccia](#panoramica-interfaccia)
3. [Menu Hamburger](#menu-hamburger)
4. [Caricamento Ritmi (Libreria e Batà)](#caricamento-ritmi-libreria-e-batà)
5. [Timeline e Sezioni](#timeline-e-sezioni)
6. [Barra Impostazioni Sezione](#barra-impostazioni-sezione)
7. [Editor Griglia](#editor-griglia)
8. [Modalità di Editing](#modalità-di-editing)
9. [Gestione Tracce](#gestione-tracce)
10. [Gestione Misure](#gestione-misure)
11. [Mixer](#mixer)
12. [Controlli Riproduzione](#controlli-riproduzione)
13. [Scorciatoie da Tastiera](#scorciatoie-da-tastiera)
14. [Link Condivisibili](#link-condivisibili)
15. [Suggerimenti e Buone Pratiche](#suggerimenti-e-buone-pratiche)

---

## Per Iniziare

1. Apri `desktop.html` in un browser moderno (Chrome, Firefox, Edge consigliati).
2. Attendi il completamento della schermata di caricamento.
3. Il ritmo predefinito viene caricato automaticamente (vedi [Configurazione Ritmo Predefinito](../requirements/default-rhythm.md) per l'override tramite `?rhythm=`).

---

## Panoramica Interfaccia

L'interfaccia desktop è composta da quattro aree principali:

### Barra Intestazione

| Elemento | Descrizione |
|----------|-------------|
| **Menu Hamburger (☰)** | Operazioni sui file, opzioni di editing e guida utente |
| **Titolo** | Mostra "Percussion Studio" |
| **Info Ritmo** | Nome del ritmo corrente, nome della sezione attiva e badge ripetizioni |
| **BPM Live** | Tempo effettivo durante la riproduzione (verde quando suona, riflette l'accelerazione) |
| **Mixer (🎚)** | Apre il mixer per volume/mute per strumento |
| **Slider BPM Globale** | Regola il tempo base (40-240 BPM) |
| **Pulsante Count** | Attiva/disattiva il count-in (mostra 4 o 6 battiti, pulsa durante il conteggio) |
| **Pulsanti Riproduzione** | Stop (■) e Play/Pausa (▶/❚❚) |

Il **badge ripetizioni** mostra lo stato di riproduzione della sezione attiva:
- **Loop**: `corrente/totale` ripetizioni (es. `2/4`)
- **Ripetizioni casuali**: icona 🎲 — durante la riproduzione appare 🎲 con il conteggio effettivo
- **Play Forever**: ∞
- **Play Once**: `1×` (diventa ✓ una volta suonata)

### Pannello Timeline (Sinistra)

- Elenca tutte le sezioni del ritmo.
- Clicca una sezione per passarci.
- Trascina le sezioni per riordinarle (vedi [Timeline e Sezioni](#timeline-e-sezioni)).

### Editor Griglia (Centro)

- L'area principale per visualizzare e modificare i pattern.
- Griglia visiva con tutte le tracce, le misure e gli step.
- La testina di riproduzione evidenzia lo step corrente durante l'ascolto.

### Barra Inferiore

- **Selettore dinamiche** (riga superiore): Ghost, Soft, Normal, Loud, Accent.
- **Tavolozza colpi** (riga inferiore): Rest, Open, Presionado, Slap, Mordito, Half Mordito, Bass, Dedo, Muff.
- **Pulsante Clear**: cancella tutte le note della sezione corrente.

---

## Menu Hamburger

Clicca l'icona **☰** in alto a sinistra per accedere a:

| Opzione | Descrizione |
|---------|-------------|
| **Nuovo Ritmo** | Crea un nuovo ritmo vuoto (chiede conferma; le modifiche non salvate andranno perse) |
| **Carica Ritmo...** | Apre il browser dei ritmi (albero cartelle + Batà Explorer) |
| **Scarica Ritmo** | Salva il ritmo corrente come file YAML sul tuo computer |
| **Condividi Ritmo** | Copia un link condivisibile (solo per ritmi della libreria, vedi [Link Condivisibili](#link-condivisibili)) |
| **Opzioni di Editing** | Configura come dipingere i colpi (vedi [Modalità di Editing](#modalità-di-editing)) |
| **Guida Utente** | Apre questa documentazione (English o Italiano) |

> **Nota**: Condividi Ritmo è disponibile solo quando l'app è ospitata su GitHub Pages e il ritmo corrente proviene dalla libreria. Per i ritmi caricati da file locali o creati da zero l'opzione appare disabilitata (N/A).

---

## Caricamento Ritmi (Libreria e Batà)

### Browser Ritmi (ritmi non Batà)

1. Clicca **Carica Ritmo...** per aprire il browser.
2. Naviga nell'albero delle cartelle — clicca ▶ per espandere le cartelle.
3. Clicca sul nome di un ritmo per caricarlo.
4. **File Locali**: clicca **Carica da PC** per aprire un file `.yaml` dal tuo computer.

### Batà Explorer

I toques Batà hanno un browser dedicato con ricerca e filtri:

1. Apri **Carica Ritmo...** — le famiglie Batà appaiono come schede.
2. Usa la **barra di ricerca** per trovare un toque per nome, famiglia o variazione.
3. Usa i filtri a tendina **Orisha** e **Classificazione** (Specific, Shared, Generic). Quando un filtro Orisha è attivo, i risultati sono organizzati in zone colorate.
4. Clicca una scheda famiglia per aprire i dettagli (badge classificazione, Orishas associati, variazioni disponibili).
5. Clicca una variazione per caricarla.
6. Se non trovi nulla, usa **Cancella tutti i filtri**.

---

## Timeline e Sezioni

Il pannello timeline a sinistra gestisce la struttura del ritmo.

### Nome del Ritmo

- Il nome del ritmo è un campo di testo modificabile in cima alla timeline.
- Cliccalo e scrivi; premi **Invio** per confermare.

### Informazioni Sezione

Ogni scheda sezione mostra:

| Elemento | Descrizione |
|----------|-------------|
| **Nome** | Identificatore della sezione |
| **Metro** | Firma e step (es. 4/4 (16), 6/8 (12)) |
| **Badge di gioco** | Ripetizioni (`3`), ripetizioni casuali (🎲3), ∞ per Play Forever, `1×`/`✓` per Play Once |
| **Tempo** | ♩=BPM (ambra = personalizzato, grigio = globale) |
| **Accelerazione** | Variazione di tempo per ripetizione (icone ↑/↓, es. 5%) |

### Azioni Sezione

| Azione | Come fare |
|--------|-----------|
| **Seleziona Sezione** | Clicca sulla scheda della sezione |
| **Aggiungi Sezione** | Clicca il pulsante **+** nell'intestazione della timeline |
| **Duplica Sezione** | Passa sopra la sezione → clicca l'icona copia |
| **Elimina Sezione** | Passa sopra la sezione → clicca l'icona cestino (nascosta per l'ultima sezione) |
| **Riordina Sezioni** | Trascina una sezione dalla maniglia (≡) e rilasciala nella nuova posizione |
| **Disattiva/Attiva** | Clicca l'interruttore verde/rosso a sinistra della scheda — le sezioni disattivate vengono saltate durante la riproduzione e appaiono attenuate |

### Metadati Batà

Quando il ritmo caricato è un toque Batà, la sua descrizione appare sotto il nome del ritmo.

---

## Barra Impostazioni Sezione

La barra delle impostazioni sta in cima alla griglia e configura la sezione attiva:

| Impostazione | Descrizione |
|--------------|-------------|
| **Nome** | Nome della sezione (campo di testo modificabile) |
| **Metro** | Preset: 4/4 (4), 4/4 (8), 4/4 (16), 6/8 (6), 6/8 (12), 6/8 (24) — oppure **Custom** con input Step (1-64) |
| **Play Mode** | Tendina: **Repetitions**, **Play Forever**, **Play Once** |
| **Repeats** | Quante volte suona la sezione (1-99, solo in modalità Repetitions) |
| **Casuale (🎲)** | Attiva le ripetizioni casuali — ogni ciclo la sezione suona un numero casuale di volte tra 1 e il valore impostato |
| **Tempo** | L'icona lucchetto alterna tra BPM globale e input BPM personalizzato (40-300) |
| **Accel/Decel %** | Variazione di tempo per ripetizione (-10% a +10%, passi da 0.1) — disponibile solo in modalità Repetitions con più di 1 ripetizione |

### Modalità di Gioco

| Modalità | Comportamento |
|----------|---------------|
| **Repetitions** | Suona la sezione il numero di volte impostato, poi passa alla successiva |
| **Play Forever** | Ripete all'infinito finché non premi Stop |
| **Play Once** | Suona una volta per sessione, poi viene saltata nei cicli successivi. Mostra **Played** — clicca per resettarla e farla suonare di nuovo |

> **Nota**: modalità di gioco, ripetizioni casuali e flag disattivato valgono solo per la sessione. Il download del ritmo esporta la modalità loop con le ripetizioni impostate (l'accelerazione di tempo viene esportata).

---

## Editor Griglia

La griglia centrale è dove crei e modifichi i pattern.

### Misure e Numeri degli Step

- Ogni misura ha un'intestazione con l'etichetta (**Measure 1**, **Measure 2**, ...) e i numeri degli step (1, 2, 3...).
- I gruppi di step sono separati in base alla suddivisione della sezione (4/4 → gruppi di 4, 6/8 → gruppi di 3).

### Righe Traccia

Ogni riga è una traccia (strumento). La colonna sinistra fissa contiene:

| Controllo | Descrizione |
|-----------|-------------|
| **Nome Strumento** | Clicca per **mute/unmute** della traccia (le tracce mute appaiono attenuate con nome barrato) |
| **÷** | Suddivisione della traccia — clicca per cambiare il raggruppamento visivo |
| **⊞** | Snap — quando è ON, i colpi dipinti si allineano ai gruppi della suddivisione |
| **📦** | Sound pack — apre la modale Change Instrument |
| **🗑** | Rimuove la traccia dal ritmo |

I controlli di editing (÷, ⊞, 📦, 🗑) appaiono solo a riproduzione ferma.

### Dipingere i Colpi

1. Seleziona un colpo dalla tavolozza in basso (vedi [Modalità di Editing](#modalità-di-editing) per le alternative).
2. **Click sinistro** su una cella per dipingere il colpo selezionato.
3. **Click destro** su una cella per cancellarla rapidamente (Rest).

### Feedback Visivo

- **Celle attive**: mostrano l'icona/lettera del colpo con colore.
- **Step corrente**: evidenziato durante la riproduzione.
- **Tracce mute**: attenuate con nome barrato.
- **Colpi non validi**: un colpo che non esiste per lo strumento sotto il cursore viene indicato nella cella.

### Dinamiche

Le dinamiche controllano il **volume e l'intensità visiva** dei singoli step. Il selettore sta sopra la tavolozza dei colpi.

1. Seleziona un livello di dinamica dalla barra.
2. Dipingi i colpi come al solito — ogni colpo riceve la dinamica selezionata.
3. Gli step con dinamiche non normali mostrano cambiamenti visivi nella griglia.

| Livello | Effetto | Suggerimento Visivo |
|---------|---------|---------------------|
| **Ghost** | Molto silenzioso (30%) | Icona piccola e sbiadita |
| **Soft** | Silenzioso (60%) | Leggermente più piccola e sbiadita |
| **Normal** | Default (100%) | Icona standard |
| **Loud** | Forte (130%) | Icona più grande con alone arancione |
| **Accent** | Molto forte (160%) | Icona più grande con alone rosso |

> **Suggerimento**: le dinamiche vengono salvate nel file YAML e sono preservate scaricando o caricando i ritmi.

---

## Modalità di Editing

Apri **☰ → Opzioni di Editing** per scegliere come aggiungere i simboli alla griglia:

1. **Standard (Tavolozza Inferiore)**
   - Clicca un colpo nella tavolozza in basso, poi clicca sulle celle per dipingere.
   - Click destro su una cella per cancellarla (Rest).

2. **Pie Menu**
   - Un menu radiale veloce che appare sotto il cursore, mostrando solo i suoni validi per la traccia su cui stai passando.
   - **Trigger**: Click Destro (consigliato), Pressione Lunga, o Hover. Per Pressione Lunga e Hover puoi impostare il ritardo in millisecondi.
   - **Comportamento**:
     - *Update Palette Tool on Select* — la tavolozza inferiore segue la tua scelta dal menu.
     - *Hide Current Tool from Menu* — lo strumento che stai tenendo viene nascosto dal menu.

3. **Mouse Wheel**
   - Passa su una cella e scorri la rotella del mouse su o giù per ciclare tra i simboli dello strumento.
   - Click sinistro per depositare il simbolo.

---

## Gestione Tracce

### Aggiungere Tracce

1. Clicca **+ Add Track** sotto l'ultima traccia di una misura.
2. Scegli un **Instrument Type** (colonna sinistra) — es. IYA, ITO, OKO, CON.
3. Scegli un **Sound Pack** (colonna destra) — i pack sono elencati in due colonne; selezionandone uno compaiono i nomi dei suoi suoni in due colonne, il suono aperto viene riprodotto automaticamente e puoi cliccare un nome per ascoltarlo prima di scegliere.
4. Clicca **OK** (attivo solo quando entrambi sono selezionati) oppure **Cancel**.

### Cambiare Strumento o Sound Pack

1. Clicca il pulsante **📦** su una riga traccia (riproduzione ferma).
2. Seleziona un diverso Strumento o Sound Pack — i nomi dei suoni sono elencati in due colonne così puoi ascoltarli prima di applicare.
3. Clicca **OK** per applicare.

> **Nota**: volume e mute sono globali per strumento — valgono per ogni occorrenza dello strumento in tutte le sezioni. **Non vengono salvati** e si azzerano caricando un nuovo ritmo.

---

## Gestione Misure

Le sezioni possono contenere più misure per pattern più complessi.

### Controlli Misura

Ogni intestazione di misura permette di:
- **Duplicare** (icona copia): copia il pattern della misura in una nuova misura.
- **Eliminare** (icona cestino): rimuove la misura.

### Aggiungere Misure

- Clicca **+ Add Measure** in fondo alla griglia.
- La nuova misura eredita le tracce delle misure esistenti.

---

## Mixer

Il Mixer offre controllo di volume e mute per singolo strumento.

1. Clicca il pulsante **Mixer (🎚)** nell'intestazione.
2. Per ogni strumento della sezione puoi:
   - **Mute/Unmute** con il pulsante altoparlante — la riattivazione ripristina il volume precedente.
   - Regolare lo **slider del volume** (0-100%). Impostare il volume a 0 equivale al mute.
3. Chiudi il mixer con **✕**, **Done** o cliccando sullo sfondo.

---

## Controlli Riproduzione

### Controlli Intestazione

| Pulsante | Azione |
|----------|--------|
| **Stop (■)** | Ferma la riproduzione e resetta all'inizio |
| **Play (▶)** | Avvia dall'inizio con count-in se fermo, altrimenti dalla posizione corrente |
| **Pausa (❚❚)** | Mette in pausa alla posizione corrente |

### Controlli BPM

- **Slider BPM Globale**: lo slider nell'intestazione imposta il tempo base (40-240 BPM).
- **Override BPM Sezione**: usa l'icona lucchetto nella Barra Impostazioni Sezione per dare alla sezione un tempo personalizzato.
- **Display BPM Live**: mostra il tempo effettivo durante la riproduzione e riflette l'accelerazione.
- **Accelerazione**: le sezioni con Accel/Decel % variano il tempo live di quella percentuale a ogni ripetizione.

### Contatore Ripetizioni

- Il badge nell'intestazione mostra la ripetizione corrente / totale (`Rep 2/4`).
- Si aggiorna in tempo reale durante la riproduzione e riflette le ripetizioni casuali mentre suona.

### Count-In

Il pulsante **Count** nell'intestazione abilita un count-in prima dell'avvio.

| Impostazione | Descrizione |
|--------------|-------------|
| **Attiva/Disattiva** | Clicca il pulsante per abilitare/disabilitare |
| **Battiti** | Automaticamente 4 (per 4/4) o 6 (per 6/8 o 12/8) |
| **Visivo** | Il pulsante mostra il battito corrente e pulsa durante il count-in |
| **Audio** | Suoni click (tono più acuto sul battito 1) |

> **Nota**: il count-in suona solo quando si avvia dall'inizio (dopo Stop). Riprendere dalla pausa lo salta.

### Modalità di Gioco in Azione

- Le sezioni **Repetitions** ripetono N volte, poi suona la successiva.
- Le sezioni **Play Forever** ripetono finché non premi Stop.
- Le sezioni **Play Once** suonano una volta per sessione (il badge mostra ✓ in seguito).
- Le sezioni **disattivate** vengono saltate.

---

## Scorciatoie da Tastiera

| Tasto | Azione |
|-------|--------|
| **Barra spaziatrice** | Play/Pausa (ignorata mentre scrivi in un campo di testo) |
| **Invio** | Conferma la modifica del nome del ritmo |

---

## Link Condivisibili

Puoi condividere e ricevere link diretti a ritmi specifici.

### Condividere un Ritmo

1. Apri il ritmo che vuoi condividere.
2. Clicca **☰ → Condividi Ritmo**.
3. Il link viene copiato negli appunti.
4. Invia il link a chiunque!

### Aprire un Link Condiviso

- Aprire un URL con `?rhythm=<id>` carica automaticamente quel ritmo (sovrascrive il ritmo predefinito).

> **Nota**: Condividi Ritmo è disponibile solo per i ritmi della libreria (repository GitHub), sul sito ospitato. I ritmi caricati da file locali o creati da zero non possono essere condivisi via URL.

---

## Suggerimenti e Buone Pratiche

1. **Usa le sezioni per la struttura del brano**: crea sezioni separate per Intro, Verso, Ritornello, ecc.
2. **Parti dai ritmi esistenti**: carica qualcosa di simile, poi modificalo.
3. **Usa le modalità di gioco**: Play Once per le intro, Play Forever per gli assoli, disattiva le sezioni che non servono.
4. **Sperimenta con le ripetizioni casuali (🎲)** per pattern organici e vari.
5. **Usa l'accelerazione di tempo** per creare crescendo con aumenti graduali.
6. **Organizza con le misure** per pattern di call-and-response.
7. **Scarica regolarmente** per salvare il tuo lavoro.

---

*Buona percussione! 🥁*
