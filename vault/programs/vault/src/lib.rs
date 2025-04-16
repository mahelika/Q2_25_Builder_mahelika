#![allow(unexpected_cfgs)] //silences warnings about unexpected cnfgs
use anchor_lang::{ prelude::*, system_program::{ transfer, Transfer } };
declare_id!("3FPnbLK8qQTL3q4EECUwLv4eDU1PWAewLYmkKan4M5VP"); //address 

#[program] 
pub mod vault { 
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.initialize(&ctx.bumps)
        // Ok(())
    }

    pub fn deposit(ctx: Context<Transaction>, amount: u64)-> Result<()> {
        ctx.accounts.deposit(amount)
    }

    pub fn withdraw(ctx: Context<Transaction>, amount: u64)-> Result<()> {
        ctx.accounts.withdraw(amount)
    }

    pub fn close(ctx: Context<Close>) -> Result<()> {
        ctx.accounts.close()
    }
}

#[derive(Accounts)] // processes the following struct, creating account validation logic
pub struct Initialize <'info>{
// specifies accounts required for the initialize instruction
    #[account(mut)]
    pub user: Signer <'info>, // account that signs tx

    //configuring the vault_state with parameters
    #[account( 
        init, //init the user as a new acc
        payer = user, //user pays for acc creation
        seeds = [b"state", user.key().as_ref()], //derives PDA using state and pubkey
        bump, //bump is automatically provided by anchor (try and match se)
        space = VaultState::INIT_SPACE //allocates space based on VaultState struct
    )]

    pub vault_state: Account<'info, VaultState>, 
    // configure the vault account as a PDA derived from "vault" and the user's public key:
    #[account(
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]

    pub vault: SystemAccount<'info>, //system acc 
    pub system_program: Program<'info, System> //includes solana system program (needed for acc creation)
}

//saving the bump seeds
impl<'info> Initialize<'info> {
    pub fn initialize(&mut self, bumps: &InitializeBumps) -> Result<()> {
        self.vault_state.vault_bump = bumps.vault; //stores the vault's bump seed in the vault_state account
        self.vault_state.state_bump = bumps.vault_state; //stores the vault_state bump seed in the vault_state account.

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Transaction<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        seeds = [b"state", user.key().as_ref()],
        bump = vault_state.state_bump
    )]

    pub vault_state: Account<'info, VaultState>,
    #[account(
        mut, // Added mut here to allow writing to this account
        seeds = [b"vault", user.key().as_ref()],
        bump = vault_state.vault_bump
    )]

    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>
}

impl<'info>Transaction<'info> {
    pub fn deposit(&mut self, amount: u64)-> Result<()> {
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.user.to_account_info(), //from user 
            to: self.vault.to_account_info(), //from vault
        };

        //user is the signer, so no need for new_with_signer, only needed when PDA is sending funds
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer(cpi_ctx, amount)
    }

    pub fn withdraw(&mut self, amount: u64) -> Result<()> {
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(), //from vault
            to: self.user.to_account_info(), //to user
        };

        //defining seeds to sign
        let user_key = self.user.key(); //store in variable to extend lifetime, avoids "temporary value dropped" error
        let seeds = &[
            b"vault",
            user_key.as_ref(),
            &[self.vault_state.vault_bump],
        ];

        let user_seeds = &[&seeds[..]]; 
        // new_with_signer because we're transferring from the pda (pda needs to sign)
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, user_seeds); 

        transfer(cpi_ctx, amount)
    }
}

#[derive(Accounts)]
pub struct Close<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    // main pda account storing vault-related data
    #[account(
        mut, // so it can be closed
        seeds = [b"state", user.key().as_ref()], 
        bump = vault_state.state_bump, // Fixed: should be state_bump, not vault_bump
        close = user //once closed, the remaining rent in this account is sent to user
    )]
    pub vault_state: Account<'info, VaultState>,

    //the vault PDA holding SOL
    #[account(
        mut, // mut bcoz we're withdrawing its balance
        seeds = [b"vault", user.key().as_ref()],
        bump = vault_state.vault_bump
    )]
    pub vault: SystemAccount<'info>, //holds SOL, not a token account
    pub system_program: Program<'info, System>, // required for SOL transfers and account closing via cpi
}

impl<'info> Close<'info> {
    pub fn close(&mut self) -> Result<()> {
        let vault_balance = self.vault.lamports();

        // if the vault isn't empty, transfer all SOL from vault-> user.
        if vault_balance > 0 {
            let cpi_program = self.system_program.to_account_info();
            let cpi_accounts = Transfer {
                from: self.vault.to_account_info(),
                to: self.user.to_account_info(),
            };

            // Fixed: Use correct seeds for vault PDA
            let user_key = self.user.key();
            let seeds = &[
                b"vault",
                user_key.as_ref(),
                &[self.vault_state.vault_bump],
            ];
            let user_seeds = &[&seeds[..]];

            //vault is a PDA, so program must sign on its behalf
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, user_seeds);

            transfer(cpi_ctx, vault_balance)?;
        }
        Ok(())
    }
}

#[account]
// #[derive(InitSpace)]
pub struct VaultState {
    pub vault_bump: u8, //1 byte
    pub state_bump: u8, //1 byte
}

impl Space for VaultState {
    const INIT_SPACE: usize = 8 + 1 + 1; //8 bytes for acc discriminator (identifies acc type) 
}