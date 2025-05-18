import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

import * as fs from "fs";

const wallet = JSON.parse(fs.readFileSync("./wallet/dev-wallet.json", "utf-8"));

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("7x66aZ6dFqobA1E9PbJMn9hwNM5EXyBKRFryevdkDQPA");

// Recipient address
const to = new PublicKey("gyQyxHt1XNvaUJcySyhtv9bRd522HsrXdiyYjeZnAYW");

const amount = 1_000_000 * 10 ** 6;

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        // Get the token account of the toWallet address, and if it does not exist, create it
        // Transfer the new token to the "toTokenAccount" we just created

        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey
        );

        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            to
        );

        const tx = await transfer(
            connection,
            keypair,
            fromTokenAccount.address,
            toTokenAccount.address,
            keypair.publicKey, 
            amount
        );

        console.log(`✅ Transfer successful! TX ID: ${tx}`);
        console.log(`🔗 View transaction: https://explorer.solana.com/tx/${tx}?cluster=devnet`);

    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();