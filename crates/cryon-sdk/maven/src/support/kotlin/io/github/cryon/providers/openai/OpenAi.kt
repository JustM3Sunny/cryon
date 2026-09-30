package io.github.cryon.providers.openai

public fun provider(
    apiKey: String,
    baseUrl: String? = null,
): io.github.cryon.Provider = io.github.cryon.openaiProvider(apiKey, baseUrl)

public fun defaultModel(): String = io.github.cryon.openaiDefaultModel()
