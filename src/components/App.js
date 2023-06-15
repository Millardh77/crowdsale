import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers'

// Components
import Navigation from './Navigation';
import Info from './Info';

function App() {
    const [provider, setProvider] = useState(null)
    const [account, setAccount] = useState(null)

    const [accountBalance, setAccountBalance] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const loadBlockchainData = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider)

        // Fetch account
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account)

        // // Fetch account balance
        // const accountBalance = ethers.utils.formatUnits(await token.balanceOf(account), 18)
        // setAccountBalance(accountBalance)


        setIsLoading(false)
    }

    useEffect(() => {
        if (isLoading) {
          loadBlockchainData()
        }
      }, [isLoading])

      return(
        <Container>
            <Navigation />
            <hr />
            {account && (
            <Info account={account} />
        )}

        </Container>
    )
}

export default App;