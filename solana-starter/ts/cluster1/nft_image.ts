import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import { readFile } from "fs/promises"

import * as fs from "fs";
const wallet = JSON.parse(fs.readFileSync("./wallet/dev-wallet.json", "utf-8"));

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');
umi.use(irysUploader({address: "https://devnet.irys.xyz/",}));

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        //1. Load image
        const imagePath = "./jeff.png"; 
        const imageBuffer = await readFile(imagePath);
        //2. Convert image to generic file.
        const imageFile = createGenericFile(
            imageBuffer, 
            "image/png",
            // {
            //     contentType: "image/png"
            // }

        );
        //3. Upload image
        // const image = ???

        // const [myUri] = ??? 
        const [myUri] = await umi.uploader.upload([imageFile]);
        // console.log("Your image URI: ", myUri);
        console.log("Your image URI: ", myUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
