import { Keypair, Connection, Commitment } from "@solana/web3.js";
import { createMint } from '@solana/spl-token';
// import wallet from "./dev-wallet.json"
import * as fs from "fs";

const wallet = JSON.parse(fs.readFileSync("./wallet/dev-wallet.json", "utf-8"));

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

(async () => {
    try {
        // Start here
        // const mint = ???
        const mint = await createMint(
            connection,     // Connection object
            keypair,       // Payer
            keypair.publicKey, // Mint authority
            null,          // Freeze authority (null means no freeze authority)
            6  
        );
        console.log("Mint Address:", mint.toBase58());
    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()
