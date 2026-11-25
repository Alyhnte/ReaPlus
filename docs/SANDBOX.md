# SANDBOX — offline VM recipe with snapshots

This note walks through a full setup on two hypervisors so ReaPlus can be tried without touching the Internet. Rule: take a snapshot first, run the experiment, then restore. It has nothing to do with store publishing; it is local verification only.

Shared rules (both platforms):

- The VM does not reach the Internet: no network (no virtual switch, or a host-only adapter whose cable is not connected).
- Every run starts from a snapshot. A dirty machine is not repaired; it is restored.
- Nothing is written to the host directory or the host network. Shared folders stay off.

## 1. Hyper-V (Windows 10/11 Pro)

Prerequisite: the Hyper-V role is on, with at least 8 GB of RAM and 40 GB of free disk.

### Step 1 — Leave the virtual switch with no network

Hyper-V Manager > Virtual Switch Manager: do NOT add an external switch that is connected to the Internet. Use only an internal switch, or attach no switch at all. The machine must have no network.

### Step 2 — Create the virtual machine

New > Virtual Machine: Generation 2, 4 GB RAM, 40 GB VHDX, install from an ISO. On the network page, select no switch ("Not connected").

### Step 3 — Install the guest operating system

Finish the install from the ISO and apply updates from offline media. If the guest warns on first boot that the network cable is not connected, that is the correct state.

### Step 4 — Bring in a ReaPlus working copy

While the VM is off, mount the VHDX on the host and copy the `dist/` output read-only, or attach that tree as an ISO. Turn off shared folders and clipboard integration.

### Step 5 — Take a snapshot

With the machine off, Checkpoint > take a snapshot named "clean-install". That point is the return address for every experiment.

### Step 6 — Run the experiment

Start the machine and run `npm test` (live tests excluded). Record the result. Experiments that need the network are skipped or fail in this offline environment. That is expected. Do NOT turn the host network on for them.

### Step 7 — Restore

Checkpoints > "clean-install" > Apply. The machine starts the next experiment clean. If the snapshot chain grows, delete the old ones and keep only the base.

## 2. VirtualBox (Windows or Linux host)

Prerequisite: VirtualBox 7 or newer, without the Extension Pack (USB and extra network features are not required).

### Step 1 — Create the machine

New: pick the type and version that match the ISO, 4 GB RAM, 40 GB VDI (dynamically allocated).

### Step 2 — Turn the network off

Settings > Network: choose "Not connected". Do NOT select bridged, NAT, or host-only. The cable-connected box stays clear. The machine runs with no network.

### Step 3 — Install the guest operating system

Attach the ISO and finish the install. Do not install the Guest Additions (drag-and-drop and the shared clipboard must stay off).

### Step 4 — Bring in a ReaPlus working copy

Add the tree as an ISO and mount it read-only from inside the guest. Drag-and-drop and shared folders stay off.

### Step 5 — Take a snapshot

Snapshots > take a snapshot named "clean-install". That point is the return address for every experiment.

### Step 6 — Run the experiment

Start the machine from the snapshot and run `npm test` (live tests excluded). It is normal for network-using experiments to be skipped. Do NOT turn the host network on.

### Step 7 — Restore

Snapshots > "clean-install" > Restore. The machine comes back clean. Delete old branches and keep only the base snapshot.

## 3. Shared checklist

Tick this list from the top before every experiment:

- [ ] No network (Hyper-V: no switch; VirtualBox: not connected)
- [ ] The "clean-install" snapshot exists and is current
- [ ] Shared folders, clipboard, and drag-and-drop are off
- [ ] The experiment was started from the snapshot
- [ ] The snapshot was restored when the experiment finished
- [ ] Nothing was written to the host directory or the host network
