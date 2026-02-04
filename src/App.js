import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Wallet from './artifacts/contracts/wallet.sol/wallet.json';
import './App.css';

let WalletAddress = "0xa4c7b3Ed5fde419BAC238e5cF1A76884D18eFfA8";

function App() {

  const [balance, setBalance] = useState('0');
  const [amountSend, setAmountSend] = useState();
  const [amountWithdraw, setAmountWithdraw] = useState();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [receiver, setReceiver] = useState('');
  const [amountTransfer, setAmountTransfer] = useState('');


  useEffect(() => {
    getBalance();
  }, [])

  async function getBalance() {
    if(typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
        if (!accounts || accounts.length === 0) {
          setError('Aucun compte MetaMask connecté.');
          return;
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const code = await provider.getCode(WalletAddress);
        if (code === '0x') {
          setError('Le contrat n\'est pas déployé à cette adresse. Veuillez déployer le contrat d\'abord.');
          return;
        }
        // Utiliser le signer pour que msg.sender soit correctement identifié
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(WalletAddress, Wallet.abi, signer);
        const data = await contract.getbalance();
        setBalance(String(data));
        setError('');
      }
      catch(err) {
        let errorMessage = 'Une erreur est survenue lors de la récupération du solde.';
        if (err?.reason) {
          errorMessage = err.reason;
        } else if (err?.message) {
          errorMessage = err.message;
        } else if (err?.data?.message) {
          errorMessage = err.data.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        }
        setError(errorMessage);
        console.error('Erreur getBalance:', err);
      }
    } else {
      setError('MetaMask n\'est pas installé. Veuillez l\'installer pour utiliser cette application.');
    }
  }

  async function transfer() {
    if (!amountSend || parseFloat(amountSend) < 0) {
      setError('Veuillez entrer un montant valide.');
      return;
    }
    setError('');
    setSuccess('');

    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask n\'est pas installé.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        setError('Aucun compte MetaMask connecté.');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      await provider.send("eth_requestAccounts", []);
      const amountToSend = ethers.parseEther(amountSend);
      // const network = await provider.getNetwork();


      // On laisse le nœud / MetaMask gérer le cas « insufficient funds »
      const tx = {
        from: accounts[0],
        to: WalletAddress,
        value: amountToSend,
      };

      const transaction = await signer.sendTransaction(tx);
      setSuccess('Transaction en cours...');

      await transaction.wait();
      setAmountSend('');
      await getBalance();
      setSuccess('Votre argent a bien été transféré sur le portefeuille !');
    } catch (err) {
      let errorMessage = 'Une erreur est survenue.';
      if (err?.reason) {
        errorMessage = err.reason;
      } else if (err?.message) {
        if (err.message.includes('user rejected')) {
          errorMessage = 'Transaction annulée par l\'utilisateur.';
          console.error("Chain ID :", new ethers.BrowserProvider(window.ethereum).getNetwork().chainId);

        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Solde insuffisant dans votre compte MetaMask.';

          
        } else {
          errorMessage = err.message;
        }
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
      setSuccess('');

    }
  }

  async function transferToAddress() {
    if (!receiver || !ethers.isAddress(receiver)) {
      setError("Adresse Ethereum invalide.");
      return;
    }
  
    if (!amountTransfer || parseFloat(amountTransfer) <= 0) {
      setError("Montant invalide.");
      return;
    }
  
    setError('');
    setSuccess('');
  
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
  
      const tx = await signer.sendTransaction({
        to: receiver,
        value: ethers.parseEther(amountTransfer),
      });
  
      setSuccess("Transaction en cours...");
      await tx.wait();
  
      setReceiver('');
      setAmountTransfer('');
      setSuccess("ETH envoyé avec succès !");
    } catch (err) {
      setError(err.message || "Erreur lors du transfert.");
    }
  }
  
  async function withdraw() {
    if(!amountWithdraw || parseFloat(amountWithdraw) <= 0) {
      setError('Veuillez entrer un montant valide.');
      return;
    }
    setError('');
    setSuccess('');
    if(typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
        if (!accounts || accounts.length === 0) {
          setError('Aucun compte MetaMask connecté.');
          return;
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(WalletAddress, Wallet.abi, signer);
        
        const amountToWithdraw = ethers.parseEther(amountWithdraw);
        const transaction = await contract.withdraw(accounts[0], amountToWithdraw);
        setSuccess('Transaction en cours...');
        await transaction.wait();
        setAmountWithdraw('');
        await getBalance();
        setSuccess('Votre argent a bien été retiré du portefeuille !');
      }
      catch(err) {
        let errorMessage = 'Une erreur est survenue.';
        if (err?.reason) {
          errorMessage = err.reason;
        } else if (err?.message) {
          // Gérer les erreurs MetaMask spécifiques
          if (err.message.includes('user rejected')) {
            errorMessage = 'Transaction annulée par l\'utilisateur.';
          } else if (err.message.includes('Insufficient balance')) {
            errorMessage = 'Solde insuffisant dans le contrat.';
          } else {
            errorMessage = err.message;
          }
        } else if (err?.data?.message) {
          errorMessage = err.data.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        }
        setError(errorMessage);
        setSuccess('');
        console.error('Erreur withdraw:', err);
      }
    } else {
      setError('MetaMask n\'est pas installé.');
    }
  }

  function changeAmountSend(e) {
    setAmountSend(e.target.value);
  }

  function changeAmountWithdraw(e) {
    setAmountWithdraw(e.target.value);
  }

  return (
    <div className="App">
      <div className="container">
  
        <div className="logo">
          <i className="fab fa-ethereum"></i>
        </div>
  
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
  
        <h2>
          {ethers.formatEther(balance || '0')} <span className="eth">ETH</span>
        </h2>
  
        <div className="wallet__flex">
  
          {/* DÉPÔT VERS LE CONTRAT */}
          <div className="walletG">
            <h3>Déposer de l'argent</h3>
            <input
              type="text"
              placeholder="Montant en ETH"
              value={amountSend || ''}
              onChange={changeAmountSend}
            />
            <button onClick={transfer}>Envoyer</button>
          </div>
  
          {/* RETRAIT DEPUIS LE CONTRAT */}
          <div className="walletD">
            <h3>Retirer de l'argent</h3>
            <input
              type="text"
              placeholder="Montant en ETH"
              value={amountWithdraw || ''}
              onChange={changeAmountWithdraw}
            />
            <button onClick={withdraw}>Retirer</button>
          </div>
  
          {/* TRANSFERT VERS UNE AUTRE ADRESSE */}
          <div className="walletC">
            <h3>Transférer de l'argent</h3>
            <input
              type="text"
              placeholder="Adresse Ethereum"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
            />
            <input
              type="text"
              placeholder="Montant en ETH"
              value={amountTransfer}
              onChange={(e) => setAmountTransfer(e.target.value)}
            />
            <button onClick={transferToAddress}>
              Transférer
            </button>
          </div>
  
        </div>
      </div>
    </div>
  );
  
}

export default App;