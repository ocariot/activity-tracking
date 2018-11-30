export class UserEntity {
    private id?: string

    public getId(): string | undefined {
        return this.id
    }

    public setId(value: string | undefined) {
        this.id = value
    }
}
