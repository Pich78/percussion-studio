# Percussion Studio - Guida Utente Mobile

Percussion Studio Mobile è ottimizzato per **ascolto e pratica**. Condivide lo stesso motore della versione desktop, con un'interfaccia touch-first progettata attorno alla **Dual Mode**: una griglia in sola lettura in orizzontale e una superficie di controllo stile music-player in verticale.

---

## Indice

1. [Per Iniziare](#per-iniziare)
2. [Panoramica Dual Mode](#panoramica-dual-mode)
3. [Orizzontale: Barra Superiore e Navigazione](#orizzontale-barra-superiore-e-navigazione)
4. [Orizzontale: La Griglia](#orizzontale-la-griglia)
5. [Orizzontale: La Barra Chips](#orizzontale-la-barra-chips)
6. [Verticale: Superficie di Controllo](#verticale-superficie-di-controllo)
7. [Menu Navigazione](#menu-navigazione)
8. [Vista Griglia Classica](#vista-griglia-classica)
9. [Capire la Griglia](#capire-la-griglia)
10. [Controlli Riproduzione](#controlli-riproduzione)
11. [Controlli delle Tracce](#controlli-delle-tracce)
12. [Sezioni](#sezioni)
13. [Link Condivisibili](#link-condivisibili)
14. [Differenze dal Desktop](#differenze-dal-desktop)
15. [Suggerimenti per l'Uso Mobile](#suggerimenti-per-luso-mobile)

---

## Per Iniziare

1. Apri `mobile.html` sul tuo telefono (oppure `index.html` — rileva il dispositivo e ti reindirizza).
2. In **orizzontale** vedi la griglia del ritmo; in **verticale** la superficie di controllo.
3. **Schermo intero** (opzionale ma consigliato): usa la PWA "Aggiungi alla schermata Home" su iPhone, o il full-screen del browser.
4. Il ritmo predefinito viene caricato automaticamente (vedi [Configurazione Ritmo Predefinito](../requirements/default-rhythm.md) per l'override tramite `?rhythm=`).

---

## Panoramica Dual Mode

La Dual Mode si adatta a come tieni il telefono:

| Orientamento | Cosa vedi |
|--------------|-----------|
| **Orizzontale** | La griglia completa del ritmo (sola lettura) con una barra chips (BPM / Mixer / Sezioni) |
| **Verticale** | Una superficie di controllo: tempo, mixer con solo, selettore sezioni, play/stop |

Puoi cambiare vista in qualsiasi momento tramite **☰ → View Mode** (vedi [Vista Griglia Classica](#vista-griglia-classica)).

---

## Orizzontale: Barra Superiore e Navigazione

La barra superiore mostra:

| Elemento | Descrizione |
|----------|-------------|
| **☰** | Apre il menu di navigazione |
| **Nome ritmo** | Titolo del ritmo corrente (indaco) |
| **‹ Sezione (n/N) ›** | Pulsanti sezione precedente/successiva con nome e posizione |
| **Badge Rep** | Ripetizione corrente (es. `2/4`), 🎲 per ripetizioni casuali, ∞ per Play Forever |
| **Badge accel** | Accelerazione di tempo per ripetizione (↑ verde per positiva, ↓ rossa per negativa) |
| **♩ BPM** | Tempo live — indaco da fermo, verde durante la riproduzione (riflette l'accelerazione) |

### Navigazione a Scorrimento (Swipe)

- **Scorri a sinistra** → sezione successiva.
- **Scorri a destra** → sezione precedente.
- Uno swipe conta quando è più orizzontale che verticale e più lungo di ~50px.

---

## Orizzontale: La Griglia

La griglia è in **sola lettura** — l'editing è una funzione desktop. Ogni misura ha i numeri degli step sopra; le celle mostrano i colpi e le loro dinamiche (vedi [Capire la Griglia](#capire-la-griglia)).

### Interazioni con le Tracce

| Gesto | Azione |
|-------|--------|
| **Tocca il nome dello strumento** | Mute/unmute della traccia (le tracce mute appaiono attenuate con nome barrato) |
| **Tocca il corpo della traccia** | Cambia la colorazione della suddivisione (l'etichetta ÷N mostra il raggruppamento corrente) |

Durante la riproduzione lo **step corrente è evidenziato** e la griglia **scorre automaticamente** per mantenere visibile la testina.

---

## Orizzontale: La Barra Chips

La barra inferiore contiene tre chips più i controlli di riproduzione:

| Chip | Apre |
|------|------|
| **♩=BPM** | Popover Tempo |
| **🎚 Mixer** | Popover volume e mute per strumento |
| **Nome sezione (n/N)** | Popover Sezioni (disabilitato durante la riproduzione) |

Accanto alle chips: il pulsante **Cnt** (count-in), **Stop (■)** e **Play/Pausa (▶/❚❚)**.

### Popover Tempo

- Grande **display del valore** (es. `120 BPM`).
- **Slider** (40-240 BPM).
- Pulsanti **−5 / −1 / +1 / +5** per passi fini e grossi.
- Tocca **Done** per chiudere.

### Popover Mixer

Per ogni strumento della sezione:

- Pulsante **Mute/Unmute** (icona altoparlante) — la riattivazione ripristina il volume precedente.
- **Slider del volume** (0-100%). Impostare il volume a 0 equivale al mute.

### Popover Sezioni

- Mostra tutte le sezioni: tocca una riga per **saltarci**.
- **Pulsante 🎲**: attiva le ripetizioni casuali (ogni ciclo suona un numero casuale di volte tra 1 e il valore impostato).
- **Selettore ripetizioni**: tocca il numero per aprire il selettore a tamburo con i valori `1`-`64`, `∞` (Play Forever), `play once` e `disabled` (salta). Trascina o fai scorrere il tamburo, tocca un valore per centrarlo, poi tocca **Done** per applicare (o **Cancel** per annullare).
  - ∞ appare in viola, le sezioni disabilitate e già suonate appaiono attenuate.
- **Selettore accelerazione** (solo per sezioni loop con più di 1 ripetizione): stesso selettore a tamburo, da `-10.0%` a `+10.0%` con passi da 0.1.

> **Nota**: queste impostazioni di sezione valgono solo per la sessione e si azzerano caricando un nuovo ritmo (vedi [Sezioni](#sezioni)).

---

## Verticale: Superficie di Controllo

In verticale il telefono diventa un player per la pratica:

### Intestazione e Info

- **☰** menu e nome del ritmo.
- **Nome sezione + badge Rep** (corrente/totale, 🎲 o ∞, con accel %).
- **BPM live** — verde durante la riproduzione.

### Riga Tempo

- Pulsanti **−1 / +1** e un grande **slider** con il valore corrente mostrato dentro.
- Il pulsante **Count** attiva/disattiva il count-in.

### Mixer

Una riga per traccia:

| Controllo | Descrizione |
|-----------|-------------|
| **Slider volume** | Regola il volume della traccia; il nome dello strumento è mostrato dentro (con ◉ quando è in solo) |
| **S** | Pulsante Solo — ambra quando attivo; suona solo la traccia in solo |
| **Mute** | Pulsante altoparlante — attiva/disattiva il mute; la riattivazione ripristina il volume precedente |

Mute e solo sono mutuamente esclusivi e può esserci una sola traccia in solo alla volta.

### Barra Sezioni

- Mostra la sezione corrente (**n/N**).
- Toccala per aprire il pannello sezioni completo (stessi controlli del popover orizzontale).
- Disabilitata durante la riproduzione.

### Barra Play

- Pulsanti **Stop** e **Play/Pausa** in fondo, dimensionati per l'uso a una mano.

---

## Menu Navigazione

Tocca **☰** per aprire il menu:

| Opzione | Descrizione |
|---------|-------------|
| **Load Rhythm** | Sfoglia e carica i ritmi (albero cartelle + Batà Explorer) |
| **Show Structure** | Vista in sola lettura di tutte le sezioni — tocca una sezione per saltarci |
| **View Mode** | Passa tra **Standard** (Griglia Classica) e **Dual Mode ↔** |
| **Share Rhythm** | Condividi il ritmo corrente (share sheet del dispositivo o appunti, solo ritmi della libreria) |
| **User Guide** | Apri questa documentazione (English o Italiano) |

---

## Vista Griglia Classica

Il layout mobile originale è ancora disponibile via **☰ → View Mode → Standard**:

- **Solo orizzontale**: in verticale mostra il messaggio "Please Rotate Your Device".
- Intestazione: menu, nome del ritmo, **tendina sezioni**, badge Rep, BPM live, **slider BPM globale**, **Cnt**, Stop/Play.
- La stessa griglia in sola lettura e lo stesso menu della Dual Mode.

La Dual Mode è la vista predefinita e consigliata.

---

## Capire la Griglia

- Ogni **riga** è una traccia strumento.
- Ogni **colonna** è uno step temporale.
- Le **celle piene** mostrano i colpi attivi con icone/lettere.
- Le **celle vuote** sono pause (silenzio).
- I **separatori** dividono gli step in gruppi in base alla suddivisione (gruppi di 4 per 4/4, gruppi di 3 per 6/8).
- Le **dinamiche** sono visive: i colpi ghost/soft sono più piccoli e sbiaditi; i colpi loud/accent sono più grandi con un alone.
- I **numeri degli step** sopra la griglia segnano le posizioni (1, 2, 3...).
- Durante la riproduzione lo **step corrente** è evidenziato e la griglia **scorre automaticamente**.

---

## Controlli Riproduzione

### Pulsanti

| Pulsante | Descrizione |
|----------|-------------|
| **Stop (■)** | Ferma la riproduzione e resetta all'inizio |
| **Play (▶)** | Avvia la riproduzione (dall'inizio con count-in se fermo) |
| **Pausa (❚❚)** | Mette in pausa alla posizione corrente |

### BPM

- Orizzontale: **popover Tempo** (barra chips) con slider e −5/−1/+1/+5.
- Verticale: **slider** con pulsanti −1/+1.
- Il display BPM live riflette l'accelerazione di tempo.

### Contatore Ripetizioni

- **Rep X/Y** mostra la ripetizione corrente sul totale e si aggiorna in tempo reale (🎲 per le ripetizioni casuali).

### Count-In

Il pulsante **Cnt** (orizzontale) / **Count** (verticale) abilita un count-in prima dell'avvio:

- Battiti: automaticamente 4 (tempo 4/4) o 6 (tempo 6/8 o 12/8).
- Visivo: il pulsante mostra il battito corrente e pulsa.
- Audio: suoni click prima dell'avvio del ritmo (tono più acuto sul battito 1).

> **Nota**: il count-in suona solo partendo dall'inizio.

### Modalità di Gioco

Le sezioni possono suonare in modalità diverse (impostate nel popover/pannello Sezioni):

- **Loop (1-64 ripetizioni)**: suona il numero impostato di volte, poi la sezione successiva.
- **∞ Play Forever**: ripete finché non premi Stop.
- **Play Once**: suona una volta per sessione (appare attenuata in seguito).
- **Disabled**: non suona mai.

---

## Controlli delle Tracce

| Controllo | Dove |
|-----------|------|
| **Mute** | Tocca il nome dello strumento sulla griglia (orizzontale), o il pulsante altoparlante in qualsiasi mixer |
| **Volume** | Popover Mixer (orizzontale) o righe mixer (verticale) |
| **Solo** | Solo nel mixer verticale (pulsante S, uno alla volta) |

> **Nota**: volume, mute e solo non vengono salvati — si azzerano caricando un nuovo ritmo.

---

## Sezioni

### Navigare

- **Orizzontale**: frecce ‹ ›, swipe sulla barra superiore, o chip Sezioni.
- **Verticale**: la barra sezioni in fondo al player.
- **Menu**: Show Structure elenca tutte le sezioni; tocca una per saltarci.

### Modificare

Nel popover/pannello Sezioni puoi cambiare, per sezione: le ripetizioni (o ∞/play once/disabled), le ripetizioni casuali (🎲) e l'accelerazione di tempo. Queste impostazioni valgono **solo per la sessione** — non vengono scritte nel YAML scaricato.

---

## Link Condivisibili

Puoi condividere e ricevere link diretti a ritmi specifici.

### Condividere un Ritmo

1. Tocca **☰ → Share Rhythm**.
2. Si apre lo share sheet del dispositivo (oppure il link viene copiato negli appunti).

### Aprire un Link Condiviso

- Un link con `?rhythm=...` carica automaticamente quel ritmo (sovrascrive il ritmo predefinito).
- Esempio: `mobile.html?rhythm=Batà/Dadà/dada_base`

> **Nota**: Condividi Ritmo è disponibile solo per i ritmi della libreria.

---

## Differenze dal Desktop

| Funzionalità | Desktop | Mobile |
|--------------|---------|--------|
| Editing griglia | ✅ Sì | ❌ Sola lettura |
| Aggiungi/Rimuovi tracce | ✅ Sì | ❌ No |
| Aggiungi/Rimuovi sezioni | ✅ Sì | ❌ No |
| Nome sezione / metro / override tempo | ✅ Sì | ❌ No |
| Modalità di gioco (reps, ∞, once, disabled) | ✅ Sì | ✅ Sì |
| Ripetizioni casuali (🎲) | ✅ Sì | ✅ Sì |
| Accelerazione di tempo | ✅ Sì | ✅ Sì |
| Mixer (volume + mute) | ✅ Sì | ✅ Sì |
| Solo | ❌ No | ✅ Sì (verticale) |
| Scarica ritmo | ✅ Sì | ❌ No |
| Carica da PC | ✅ Sì | ❌ No |
| Regolazione BPM | ✅ Sì | ✅ Sì |
| Count-in | ✅ Sì | ✅ Sì |
| Condividi ritmo | ✅ Sì | ✅ Sì |

---

## Suggerimenti per l'Uso Mobile

1. **Usa la Dual Mode**: orizzontale per seguire la griglia, verticale per praticare con il player.
2. **Muta le tracce per concentrarti**: tocca il nome dello strumento, oppure usa il mixer.
3. **Usa il solo (verticale)** per isolare un singolo strumento.
4. **Rallenta con il popover del tempo** per imparare ritmi complessi.
5. **Esplora le sezioni** con le frecce, lo swipe o la chip Sezioni.

---

*Goditi i tuoi ritmi ovunque! 🥁*
