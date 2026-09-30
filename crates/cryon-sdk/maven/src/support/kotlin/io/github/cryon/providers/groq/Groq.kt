package io.github.cryon.providers.groq

public fun provider(apiKey: String): io.github.cryon.Provider = io.github.cryon.groqProvider(apiKey)

public fun defaultModel(): String = io.github.cryon.groqDefaultModel()
