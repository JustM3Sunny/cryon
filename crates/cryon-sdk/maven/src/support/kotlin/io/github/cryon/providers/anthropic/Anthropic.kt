package io.github.cryon.providers.anthropic

public fun provider(
    apiKey: String,
    baseUrl: String? = null,
    betaHeaders: List<String> = emptyList(),
): io.github.cryon.Provider = io.github.cryon.anthropicProvider(apiKey, baseUrl, betaHeaders)

public fun defaultModel(): String = io.github.cryon.anthropicDefaultModel()
