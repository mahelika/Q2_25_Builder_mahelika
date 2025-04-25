#![allow(unexpected_cfgs)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("BycwoYq6HXSHvgJmJwSZvNr54PLWXduFhGxaRNqoZqAt");

#[program]
pub mod staking {
    use super::*;

    pub fn initializeconfig(ctx: Context<InitializeConfig>) -> Result<()> {
        Ok(())
    }

    pub fn initializeuser(ctx: Context<InitializeUser>) -> Result<()> {
         Ok(())
    }
    pub fn stake(ctx: Context<Stake>) -> Result<()> {
        Ok(())
    }
}