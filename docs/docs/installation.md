---
sidebar_label: Installation Guide
---

# Installation Guide

## Step 1: Download MeetDesk

Go to the [MeetDesk releases page](https://github.com/rjnesspor/meetdesk/releases) and download the latest installer for your platform.

- **Windows** - download the `.exe` installer and run it

Once installed, open MeetDesk from your Start menu like any other application.

:::info
MeetDesk currently supports Windows. macOS support is planned for a future release.
:::

---

## Step 2: Launch the app

Open MeetDesk. The app will start a local server automatically in the background - you don't need to do anything.

The **Control Panel** will open on your screen. In the bottom-left corner you'll see the server's local IP address. Write this down and keep it handy, since you'll need it to set up judge tablets and display screens.

:::tip
Make sure your laptop is connected to the same Wi-Fi network that your judge tablets and display screens will use. MeetDesk works entirely over the local network.
:::

---

## Step 3: Set up your meet

Before competition begins, use the Control Panel to enter your meet data in this order:

1. **Levels** - add the competition levels being contested (e.g. Level 6, Level 7, Level 8)
2. **Teams** - add the clubs or teams competing
3. **Athletes** - register each athlete, assigning them a bib number, team, level, and division

Events are pre-configured for standard gymnastics disciplines and don't need to be entered manually.

---

## Step 4: Connect judge tablets

On each judge's tablet or phone, open any web browser and go to:

```
http://<server-ip>:4721/scoring
```

Replace `<server-ip>` with the IP address shown in the bottom-left of your Control Panel - for example:

```
http://192.168.1.42:4721/scoring
```

The judge selects their event and judge number, then taps **Enter Scoring**. They'll land on the score entry screen and are ready to go.

:::tip
Bookmark this URL on each tablet before the meet starts so judges can get back to it quickly if needed.
:::

---

## Step 5: Set up a score display (optional)

If you have a TV or projector, open a browser on that device and go to:

```
http://<server-ip>:4721/display
```

Select the event this screen will display and choose how long each score stays on screen. Click **Launch Display** - the screen will show the event name and update automatically as scores come in.

---

## During the meet

Judges enter scores from their tablets. Scores appear in the Control Panel in real time and on any connected display screens.

If a score needs to be corrected, you can delete and re-enter it from the **Scores** section of the Control Panel.

---

## Generating reports

When you're ready to announce results, go to the **Reports** section of the Control Panel.

- **Event Awards** - top scores per apparatus for a given level and division
- **Team Awards** - cumulative team scores with configurable counting scores
- **Meet Roster** - full list of registered athletes, grouped by team, level, or division

Each report opens as a PDF in a new tab and can be printed directly.

---

## Saving and loading a meet

MeetDesk lets you save your entire meet - teams, athletes, scores, and all - to a single `.meet` file. You can find this option in the **Meet** section of the Control Panel.