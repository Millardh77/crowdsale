import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers'
import Countdown from 'react-countdown'

// Components
import Navigation from './Navigation';
import Progress from './Progress';
import Buy from './Buy';
import Info from './Info';
import Loading from './Loading';
import '../App.css'

// Artifacts
import CROWDSALE_ABI from '../abis/Crowdsale.json'
import TOKEN_ABI from '../abis/Token.json'

// Config
import config from '../config.json';

function App() {
    const [provider, setProvider] = useState(null)
    const [account, setAccount] = useState(null)
    const [accountBalance, setAccountBalance] = useState(0)

    const [crowdsale, setCrowdsale] = useState(null)  
    
    const [price, setPrice] = useState(0)
    const [minimumContribution, setMinContribution] = useState(0)
    const [maximumContribution, setMaxContribution] = useState(0)
    const [maxTokens, setMaxTokens] = useState(0)
    const [tokensSold, setTokensSold] = useState(0)
  

    const [isLoading, setIsLoading] = useState(true)

    const [currentTime, setCurrentTime] = useState(new Date().getTime())
    const [revealTime, setRevealTime] = useState(0)

    const loadBlockchainData = async () => {
      // Intiantiate provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider)

      // Fetch Chain ID
      const { chainId } = await provider.getNetwork()

      // Intiantiate contracts
      const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider)
      const crowdsale = new ethers.Contract(config[chainId].crowdsale.address, CROWDSALE_ABI, provider)
      setCrowdsale(crowdsale)

      // Fetch account
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account)


      // Fetch account balance
      const accountBalance = ethers.utils.formatUnits(await token.balanceOf(account), 18)
      setAccountBalance(accountBalance)
      // console.log("accountBalance:", accountBalance)

      // Fetch price
      const price = ethers.utils.formatUnits(await crowdsale.price(), 18)
      setPrice(price)

      // Fetch max tokens
      const maxTokens = ethers.utils.formatUnits(await crowdsale.maxTokens(), 18)
      setMaxTokens(maxTokens)
      console.log("maxTokens:", maxTokens)

      // Get Begin Contribution Time
      let allowBuyingAfter = await crowdsale.allowBuyingAfter()
      allowBuyingAfter = Number(allowBuyingAfter);

			let timeDeployed = await crowdsale.timeDeployed()
      timeDeployed = Number(timeDeployed);

			setRevealTime((Number(timeDeployed) + Number(allowBuyingAfter)).toString() + '000')
      console.log("allowBuyingAfter:", new Date(allowBuyingAfter))
      console.log("timeDeployed:", new Date(timeDeployed))
      console.log("current Time:", new Date(currentTime))
      console.log("reveal Time:", new Date(revealTime))

      const start = new Date();
      // some long-running operation
      const end = new Date(allowBuyingAfter);
      const elapsed = Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // elapsed time in minutes
      console.log("elapsed:", elapsed);


      // Fetch tokens sold
      let tokensSold = ethers.utils.formatUnits(await crowdsale.tokensSold(), 18)

      setTokensSold(tokensSold)

      // Fetch min contribution

      const minContribution = await crowdsale.minContributionAmount();
      //const minContribution = ethers.utils.parseUnits(await crowdsale.minContributionAmount().toString(), 'ether')
      // const minContribution = ethers.utils.formatUnits(await crowdsale.minContributionAmount(), 18)
      setMinContribution(minContribution)
      //const formattedMin = ethers.utils.parseUnits(minimumContribution.toString(), 'ether')
      const formattedMin = ethers.utils.formatUnits(minimumContribution, 18)
      console.log("minContribution:", formattedMin)

      // Fetch max contribution
      const maxContribution = ethers.utils.formatUnits(await crowdsale.maxContributionAmount(), 18)
      setMaxContribution(maxContribution)
      const formattedMax = ethers.utils.parseUnits(maximumContribution.toString(), 'ether')
      console.log("maxContribution:", formattedMax)
     

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

            <h1 className='my-4 text-center'>Introducing DApp Token!</h1>

            {isLoading ? (
        <Loading />
      ) : (
        <>
          <p className='text-center'><strong>Current Price:</strong> {price} ETH</p>
          <Buy provider={provider} price={price} crowdsale={crowdsale} setIsLoading={setIsLoading} />
          <Progress maxTokens={maxTokens} tokensSold={tokensSold} />
        </>
      )}
            <hr />
            {account && (<>
             <h3>Add your Contribution in</h3>
						{revealTime !== 0 && <Countdown date={currentTime + (revealTime - currentTime)} className='countdown' />}
        <Info account={account} accountBalance={accountBalance} />
        </>
        )}

        </Container>
    )
}

export default App;