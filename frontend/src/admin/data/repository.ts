export interface Repository<T extends { id: string; order: number }> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | null>;
  create(input: Omit<T, "id">): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
  reorder(ids: string[]): Promise<void>;
}

export interface DocumentStore<T> {
  read(): Promise<T>;
  write(value: T): Promise<T>;
}
