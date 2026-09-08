# AsyncAPI embeds

## Inline spec

```asyncapi
asyncapi: 3.0.0
info:
  title: Inline Orders API
  version: 0.1.0
channels:
  orders:
    address: orders/created
    messages:
      orderCreated:
        payload:
          type: object
          properties:
            id:
              type: string
operations:
  onOrderCreated:
    action: receive
    channel:
      $ref: '#/channels/orders'
```

## File reference

```asyncapi
file: specs/streetlights-3.yaml
```

## Missing file

```asyncapi
file: specs/does-not-exist.yaml
```

## Empty block

```asyncapi
```
