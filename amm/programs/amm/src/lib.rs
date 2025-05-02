#![allow(unexpected_cfgs)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("4sx1GKgmxqhenUfugnSPVfdbEizg2U7rRD21Vg3iGviB");

#[program]
pub mod amm {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>, 
        seed: u64,
        fee: u16,
        _authority: Option<Pubkey>
    ) -> Result<()> {
        ctx.accounts.initialize(seed, fee, _authority, &ctx.bumps)
    }


}
