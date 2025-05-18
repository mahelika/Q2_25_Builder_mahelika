import { Keypair, PublicKey, Connection, Commitment } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import * as fs from "fs";

const wallet = JSON.parse(fs.readFileSync("./wallet/dev-wallet.json", "utf-8"));

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const token_decimals = 1_500_000_000_000n;

// Mint address
const mint = new PublicKey("7x66aZ6dFqobA1E9PbJMn9hwNM5EXyBKRFryevdkDQPA");

(async () => {
    try {
        // Create an ATA
        // const ata = ???
        // console.log(`Your ata is: ${ata.address.toBase58()}`);
        const ata = await getOrCreateAssociatedTokenAccount(
            connection,         
            keypair,            
            mint,               
            keypair.publicKey   
        );
        console.log(`Your ATA is: ${ata.address.toBase58()}`);

        // Mint to ATA
        // const mintTx = ???
        // console.log(`Your mint txid: ${mintTx}`);
        const mintTx = await mintTo(
            connection,              
            keypair,                 
            mint,                    
            ata.address,             
            keypair.publicKey,       
            token_decimals           
        );
        console.log(`Your mint txid: ${mintTx}`);
    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()
