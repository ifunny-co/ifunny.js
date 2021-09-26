const Client = require("./Client")

class User {

    /**
     * User object for making api calls easier to the client and interacting with Users
     * @param {Client} client - Client object
     * @param {Object} data - user data payload
     * @param {boolean} [apiCall=false] - Whether or not its an api call will decide how it parses the data
     * @param {boolean} data.is_subscribed_to_updates - idk
     * @param {object} data.meme_experience - Days rank
     * @param {string} data.messaging_privacy_status - Chat privacy
     * @param {boolean} data.is_available_for_chat - Can the client chat with the user
     * @param {boolean} data.is_private - Is the user private
     * @param {string} data.messenger_token - idk
     * @param {boolean} data.messenger_active - idk
     * @param {Array<{id: string, date_until: number, type: string}>} data.bans - List of the user's bans
     * @param {object} data.photo - User's profile photo
     * @param {string} data.photo.bg_color - User's profile photo background color
     * @param {object} data.photo.thumb - User's profile photos resized
     * @param {object} data.photo.thumb.large_url - User's profile photos at 400px
     * @param {object} data.photo.thumb.medium_url - User's profile photos at 200px
     * @param {object} data.photo.thumb.small_url - User's profile photos at 100px
     * @param {object} data.photo.url - User's profile photo url
     * @param {string} data.web_url - User's profile url
     * @param {boolean} data.is_blocked - Did you block the user
     * @param {boolean} data.are_you_blocked - Did the user block you
     * @param {string} data.about - User's bio
     * @param {string} data.cover_url - User's profile cover photo url
     * @param {string} data.cover_bg_color - User's profile cover background color
     * @param {string} data.id - User's id
     * @param {string} data.nick - User's nickname / username
     * @param {boolean} data.is_verified - Is the use verified
     * @param {boolean} data.is_banned - Is the user banned
     * @param {boolean} data.is_deleted - Is the user deleted
     * @param {boolean} data.is_in_subscriptions - Are you subscribed to the user
     * @param {boolean} data.is_in_subscribers - Is the user subscribed to you
     * @param {object} data.num - User'stats
     * @param {number} data.num.subscriptions - How many accounts is the user subscribed to
     * @param {number} data.num.subscribers - How many subscribers the user has
     * @param {number} data.num.created - How many posts are original
     * @param {number} data.num.total_posts - How many posts the user has
     * @param {number} data.num.featured - How many features the user has
     * @param {number} data.num.total_smiles - How many smiles the user has
     * @param {number} data.num.achievements - How many achievements the user has
     * @param {object} data.rating - The user's level object (deprecated by iFunny)
     * @param {number} data.rating.points - User's level points
     * @param {object} data.rating.current_level User's current level object
     * @param {object} data.rating.next_level User's next level object
     * @param {object} data.rating.max_level User's max level object
     * @param {boolean} data.rating.is_show_level - Does the level show on the profile
     * @param {string} data.rating.current_level.id - Id of the current level
     * @param {number} data.rating.current_level.value - Value of the current level (level 1, level 2, etc)
     * @param {number} data.rating.current_level.points - Points on current level
     * @param {string} data.rating.next_level.id - Id of the current level
     * @param {number} data.rating.next_level.value - Value of the current level (level 1, level 2, etc)
     * @param {number} data.rating.next_level.points - Points on current level
     * @param {string} data.rating.max_level.id - Id of the current level
     * @param {number} data.rating.max_level.value - Value of the current level (level 1, level 2, etc)
     * @param {number} data.rating.max_level.points - Points on current level
     */
    constructor(client, data, apiCall=false) {
        Object.assign(this, data)
        this.client = client
    }

    /**
     * Creates a chat with a user, needs finished.
     */
    createChat() {

    }
}

module.exports = User
