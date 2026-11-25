# WSL — tools that need Linux (binwalk / unblob)

Ubuntu WSL is installed. `sudo` asks for a password. There is no automatic install.

## Manual install (once)

```powershell
wsl -d Ubuntu
sudo apt update && sudo apt install -y binwalk python3-pip
pip install unblob
```

## Use

Once installed, `rea_firmware_extract` runs on the Linux side.
Check: `wsl -d Ubuntu -- binwalk -h`
