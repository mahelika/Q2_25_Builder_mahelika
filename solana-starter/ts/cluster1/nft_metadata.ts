import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"

import * as fs from "fs";
const wallet = JSON.parse(fs.readFileSync("./wallet/dev-wallet.json", "utf-8"));

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

        // const image = ???
        const image = "https://gateway.irys.xyz/x3WYwMeAUBpvm3kh2RGyZyo11P9CFHcGBmpjHLWzTpd"; // Update with your image file
   
        const metadata = {
            name: "cool Jeff",
            symbol: "JNFT",
            description: "Jeff just unlocked 200 IQ mode. With those sleek glasses, he sees through the matrix. Own this NFT and channel Jeff's genius energy! 🕶️🔥",
            image: image,
            attributes: [
                { trait_type: "Accessory", value: "Glasses" },
                { trait_type: "Mood", value: "Ultra Smart" }
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: image
                    }
                ]
            },
            creators: []
        };
        const myUri = await umi.uploader.uploadJson(metadata);
        console.log("Your metadata URI: ", myUri);
       
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
