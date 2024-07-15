import './App.css'
import claim from "./assets/claim.json"
import { leaves, leaf } from "./assets/merkleLeaves.json"
import { useAccount, /*useWaitForTransactionReceipt,*/ useWriteContract,/*useReadContract*/ } from 'wagmi'
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { parseEther } from 'viem';
import { useEffect, useState } from 'react';
// import { sepolia, mainnet } from 'viem/chains';
import { ethers } from 'ethers';
import CircularProgress from '@mui/material/CircularProgress';
import { Alert } from '@mui/material';
function hashLeaf(address, amount) {
  let abi = ethers.AbiCoder.defaultAbiCoder();
  return "0x" + keccak256(
    abi.encode(
      ['address', 'uint256'],
      [address, amount]
    )
  ).toString("hex");
}

// const erc20abi = [
//   {
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "account",
// 				"type": "address"
// 			}
// 		],
// 		"name": "balanceOf",
// 		"outputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// ];

function App() {
  const [proof, setProof] = useState([])
  const [errorMsg, setError] = useState(null)
  const { isConnected,address } = useAccount()
  const { data: hash, writeContract, error, isError, isPending, isSuccess } = useWriteContract()
  // const result = useReadContract({
  //   abi: erc20abi,
  //   address: claim.tokenAddress, 
  //   functionName: 'balanceOf',
  //   args: [
  //     address,
  //   ],
  // })
 
  useEffect(() => {
    if (address) {
      const merkleTree = new MerkleTree(leaves, keccak256, {
        hashLeaves: true,
        sortPairs: true,
      });
      if(leaf[address]){
      let _proof = merkleTree.getHexProof("0x" + keccak256(hashLeaf(address, parseEther(leaf[address]))).toString("hex"));
      setProof(_proof)
      }
    }
  }, [address])

  async function handleClick() {
    if (address && proof && leaf[address]) {
      writeContract({
        abi: claim.abi,
        address: claim.address,
        functionName: 'claimKAKU',
        args: [
          parseEther(leaf[address]),
          proof
        ],
      })
    }else{
      setError("Nothing to claim")
    }
  }

  useEffect(() => {
    if (isError) {
      console.log('error', error)
    }
    if(isSuccess){
      console.log('tx hash', hash)
    }
    if(!isConnected){
      setError(null)
    }
  

  }, [isSuccess,error, isError,isConnected]);

  return (
    <>

      <div className="elementor-element elementor-element-ac61cbc elementor-widget elementor-widget-image" style={{
        marginBottom: '15px',
      }}>
        <img width="147" height="165" src="https://kaku.finance/wp-content/uploads/2024/06/kaku-logo-white.svg" alt="kaku finance" />
      </div>
      <div className="elementor-element elementor-element-d62dbc1 elementor-widget elementor-widget-heading">
        <h2 className="elementor-heading-title elementor-size-default">A New Era of Finance is on Its Way!</h2>
      </div>
      <div style={{ marginTop: "15px" }}>
      <div className='connect-wallet-btn'>
            <w3m-button />
          </div>
          <div>
          </div>
        {isConnected ? (
          <>

            <div className='claim-btn' onClick={handleClick}>
              {isPending ? (<CircularProgress />) : "Claim your $KKFI"}
            </div>

          </>

        ) : (
         null
        )}
        
      </div>
      {isSuccess ? (<Alert variant="filled" severity="success">
        you have successfully claimed your $KKFI
      </Alert>) : null}

      {isError ? (<Alert variant="filled" severity="error">
        {error.message.includes("AlreadyClaimed")?"Already Claimed":"some thing when wrong"}
      </Alert>) : null}
      {errorMsg ? (<Alert variant="filled" severity="error">
        {errorMsg}
      </Alert>) : null}


    </>
  )
}

export default App
