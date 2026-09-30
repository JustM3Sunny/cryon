use crate::conversation::message::Message;
use crate::conversation::Conversation;
use crate::providers::base::ProviderUsage;
use crate::recipe::Recipe;
use crate::session::ExtensionData;
use cryon_agent::operation::{ConversationEffect, MachineEffect};

pub enum CryonEffect {
    Conversation(ConversationEffect),
    CompactConversation {
        conversation: Conversation,
        usage: Option<ProviderUsage>,
    },
    SetRecipe(Box<Option<Recipe>>),
    SetExtensionData(ExtensionData),
    RecordUsage(ProviderUsage),
}

impl MachineEffect for CryonEffect {
    fn ensure_message_ids(&mut self) {
        match self {
            CryonEffect::Conversation(effect) => effect.ensure_message_ids(),
            CryonEffect::CompactConversation { conversation, .. } => {
                for message in conversation.messages_mut() {
                    if message.id.is_none() {
                        message.id = Some(format!("msg_{}", uuid::Uuid::new_v4()));
                    }
                }
            }
            _ => {}
        }
    }
}

impl From<ConversationEffect> for CryonEffect {
    fn from(effect: ConversationEffect) -> Self {
        CryonEffect::Conversation(effect)
    }
}

impl From<Message> for CryonEffect {
    fn from(message: Message) -> Self {
        ConversationEffect::from(message).into()
    }
}

impl From<Conversation> for CryonEffect {
    fn from(conversation: Conversation) -> Self {
        ConversationEffect::from(conversation).into()
    }
}
