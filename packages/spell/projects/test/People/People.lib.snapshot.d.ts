import { Thing, List } from "@spell-app/core/model"
export declare class Person extends Thing {
  accessor name: string
  accessor nickname: string
  accessor emails: List<string>
  accessor dates: List<DatedEvent>
}
export declare class DatedEvent extends Thing {
  accessor label: string
  accessor day: Date
  static savedInline: boolean
}
export declare class Note extends Thing {
  accessor body: string
}
export declare class Relationship extends Thing {
  accessor kind: string
  accessor person: Person
  accessor notes: List<Note>
}
export declare class FriendList extends Thing {
  accessor name: string
  accessor relationships: List<Relationship>
}
