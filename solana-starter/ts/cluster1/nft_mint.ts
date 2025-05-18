import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi"
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import * as fs from "fs";
const wallet = JSON.parse(fs.readFileSync("./wallet/dev-wallet.json", "utf-8"));
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata())

const mint = generateSigner(umi);

(async () => {
    // let tx = ???
    // let result = await tx.sendAndConfirm(umi);
    // const signature = base58.encode(result.signature);
    
    // console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)
    const tx = createNft(umi, {
        mint,
        "name": "cool Jeff",
        "symbol": "JNFT",
        uri: "https://gateway.irys.xyz/x3WYwMeAUBpvm3kh2RGyZyo11P9CFHcGBmpjHLWzTpd", 
        sellerFeeBasisPoints: percentAmount(9), 
    });

    const result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);

    console.log(`Successfully Minted! Check your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log("Mint Address:", mint.publicKey);
})();