// class Players{
//     constuctor(){
//         this.players = [];
//     }

//     addPlayer(player)
//     {
//         this.players.push(player);
//     }
// }

class Player
{
    constructor(player_id, max_hp = 100, max_mana = 100)
    {
        // Used to identify individual players
        this.player_id = player_id;

        // Max hp and mana the player has
        this.max_hp = max_hp;
        this.max_mana = max_mana

        // Current hp. When hp reaches 0, you die
        this.hp = max_hp;

        // Current mana. Players need mana to perform spells
        this.mana = max_mana

        // Percent damage after shield
        // (1.0 means all damage goes through, 0.0 means no damage goes through)
        this.shield = 1.0;
    }
    
    applySpell(spell)
    {
        if (spell.target_player_id === this.player_id)
        {
            let hp_change = (spell.hp_change > 0.0 ? spell.hp_change : spell.hp_change*this.shield);
            hp_change *= spell.effectiveness_percent;
            this.hp += hp_change;

            console.log("Player "+ this.player_id+" had an hp change of "+hp_change);
        }
    }

    changeMana(change)
    {
        this.mana += change;
    }
}

class Spell
{
    constructor(hp_change = 0, target_player_id = -1, mana_cost = 0, effectiveness_percent = 0.0)
    {
        this.hp_change = hp_change;
        this.target_player_id = target_player_id;
        this.mana_cost = mana_cost;
        this.effectiveness_percent = effectiveness_percent;
    }

    updateSpell(hp_change, target_player_id, mana_cost, effectiveness_percent)
    {
        // Only update values that are not null
        if (hp_change) {this.hp_change = hp_change;}
        if (target_player_id) {this.target_player_id = target_player_id;}
        if (mana_cost) {this.mana_cost = mana_cost;}
        if (effectiveness_percent) {this.effectiveness_percent = effectiveness_percent;}
    }
}