package io.github.cryon.providers.databricks

public fun provider(host: String, token: String): io.github.cryon.Provider =
    io.github.cryon.databricksProvider(host, token)

public fun defaultModel(): String = io.github.cryon.databricksDefaultModel()
