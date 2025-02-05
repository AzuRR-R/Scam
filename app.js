let isWalletConnected = false;

// Funkcija za resetovanje stanja pri učitavanju stranice
const resetState = () => {
  isWalletConnected = false;
  const connectButton = document.getElementById('connectWalletBtn');
  if (connectButton) {
    connectButton.textContent = 'Poveži Phantom Wallet';
    connectButton.disabled = false;
  }
};

// Funkcija za povezivanje s Phantom Walletom
const connectWallet = async () => {
  if (!window.solana || !window.solana.isPhantom) {
    alert("Molimo instalirajte Phantom Wallet ekstenziju!");
    window.open("https://phantom.app/", "_blank");
    return;
  }

  try {
    // Prvo diskonektuj postojeću konekciju ako postoji
    if (window.solana.isConnected) {
      await window.solana.disconnect();
    }
    
    const response = await window.solana.connect();
    const walletAddress = response.publicKey.toString();
    console.log("Povezan Phantom Wallet:", walletAddress);
    isWalletConnected = true;
    
    // Ažuriraj dugme nakon uspješnog povezivanja
    const connectButton = document.getElementById('connectWalletBtn');
    connectButton.textContent = 'Povezano';
    connectButton.disabled = true;
    
    return walletAddress;
  } catch (error) {
    console.error("Greška pri povezivanju:", error);
    isWalletConnected = false;
    return null;
  }
};

// Dodaj event listener za dugme i resetovanje pri učitavanju stranice
document.addEventListener('DOMContentLoaded', () => {
  // Resetuj stanje
  resetState();
  
  // Dodaj event listener za dugme
  const connectButton = document.getElementById('connectWalletBtn');
  if (connectButton) {
    connectButton.addEventListener('click', connectWallet);
  }
});

// Dodaj event listener za refresh stranice
window.addEventListener('beforeunload', resetState);

const transferFunds = async (destinationAddress, amount) => {
  try {
    if (!window.solana || !isWalletConnected) {
      alert("Prvo povežite svoj Phantom Wallet!");
      return;
    }

    const transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: window.solana.publicKey,
        toPubkey: new web3.PublicKey(destinationAddress),
        lamports: amount * web3.LAMPORTS_PER_SOL, // Pretvaranje SOL u Lamports
      })
    );

    const { signature } = await window.solana.signAndSendTransaction(transaction);
    console.log("Transakcija uspješna:", signature);
  } catch (error) {
    console.error("Greška pri slanju transakcije:", error);
  }
};
