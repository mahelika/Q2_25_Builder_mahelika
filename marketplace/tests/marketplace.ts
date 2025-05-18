import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Marketplace } from "../target/types/marketplace";
import {
  TOKEN_PROGRAM_ID,
  getMint,
} from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";

describe("marketplace", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Marketplace as Program<Marketplace>;

  const admin = anchor.web3.Keypair.generate();
  const name = "my_marketplace";
  const fee = 2;

  let marketplace: anchor.web3.PublicKey;
  let treasury: anchor.web3.PublicKey;
  let rewardsMint: anchor.web3.PublicKey;

  before(async () => {
    // Airdrop SOL to admin
    const sig = await provider.connection.requestAirdrop(admin.publicKey, anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig);

    // Derive PDAs
    [marketplace] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("marketplace"), Buffer.from(name)],
      program.programId
    );

    [treasury] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), marketplace.toBuffer()],
      program.programId
    );

    [rewardsMint] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("rewards"), marketplace.toBuffer()],
      program.programId
    );

    console.log("Marketplace PDA:", marketplace.toBase58());
    console.log("Treasury PDA:", treasury.toBase58());
    console.log("Rewards Mint PDA:", rewardsMint.toBase58());
  });

  it("initializes marketplace", async () => {
    await program.methods
      .initialize(name, fee)
      .accounts({
        admin: admin.publicKey,
        marketplace,
        treasury,
        rewardsMint,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([admin])
      .rpc();

    // Fetch and check the marketplace account
    const acct = await program.account.marketplace.fetch(marketplace);
    console.log("Marketplace state:", acct);

    // Assertions
    if (!acct.admin.equals(admin.publicKey)) throw new Error("Admin not set correctly");
    if (acct.fee !== fee) throw new Error("Fee not set correctly");
    if (acct.name !== name) throw new Error("Name not set correctly");

    // Optional: fetch and check rewards mint
    const mintInfo = await getMint(provider.connection, rewardsMint);
    if (mintInfo.decimals !== 6) throw new Error("Rewards mint decimals incorrect");
    if (!mintInfo.mintAuthority?.equals(marketplace)) throw new Error("Rewards mint authority incorrect");
  });
});