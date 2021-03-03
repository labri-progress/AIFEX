import Action from "./Action";
import Mapping from "./Mapping";

// Value Object
export default class ActionToMappingService {
    public static findMappingForAction(action: Action, mappingList: Mapping[]): Mapping | undefined{
        return mappingList.find((mapping) => mapping.output.prefix === action.kind);
    }
}
