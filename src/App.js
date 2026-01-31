import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Wallet from './artifacts/contracts/wallet.sol/wallet.json';
import './App.css';

let WalletAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {

  const [balance, setBalance] = useState('0');
  const [amountSend, setAmountSend] = useState();
  const [amountWithdraw, setAmountWithdraw] = useState();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    if (!amountSend || parseFloat(amountSend) <= 0) {
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
      const amountToSend = ethers.parseEther(amountSend);

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
      console.error('Erreur transfer:', err);
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
        <h2>{ethers.formatEther(balance || '0')} <span className="eth">eth</span></h2>
        <div className="wallet__flex">
          <div className="walletG">
            <h3>Envoyer de l'ether</h3>
            <input type="text" placeholder="Montant en Ethers" onChange={changeAmountSend} />
            <button onClick={transfer}>Envoyer</button>
          </div>
          <div className="walletD">
            <h3>Retirer de l'ether</h3>
            <input type="text" placeholder="Montant en Ethers" onChange={changeAmountWithdraw} />
            <button onClick={withdraw}>Retirer</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;