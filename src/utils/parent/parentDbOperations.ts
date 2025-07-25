
import { supabase } from "@/integrations/supabase/client";
import { ParentInfo } from "./parentTypes";
import { 
  getCachedParentInfo, 
  hasErrorLock, 
  setErrorLock, 
  updateParentCache, 
  clearParentCache 
} from "./parentCache";

/**
 * Fetch parent information by user ID
 */
export async function fetchParentInfoById(userId: string) {
  try {
    console.log("fetchParentInfoById called for:", userId);
    
    // Check if we had a recent error for this user
    if (hasErrorLock(userId)) {
      console.log("Error lock active for user, using cache if available");
      return getCachedParentInfo(userId);
    }
    
    // Check cache first
    const cachedInfo = getCachedParentInfo(userId);
    if (cachedInfo) {
      console.log("Returning cached parent info for:", userId);
      return cachedInfo;
    }
    
    console.log("Fetching fresh parent info from database for user:", userId);
    const { data, error } = await supabase
      .from('parents')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching parent data:", error.message, error.details, error.hint);
      // Add to error lock to prevent hammering
      setErrorLock(userId);
      return getCachedParentInfo(userId); // Return cached data as fallback
    }
    
    if (data) {
      console.log("Parent data retrieved successfully:", data);
      const parentInfo = {
        id: data.id,
        name: data.name,
        relationship: data.relationship,
        email: data.email,
        emergencyContact: data.emergency_contact,
        additionalInfo: data.additional_info
      };
      
      // Update cache
      updateParentCache(userId, parentInfo);
      
      return parentInfo;
    }
    
    console.log("No parent data found for user:", userId);
    return null;
  } catch (error) {
    console.error("Error in fetchParentInfoById:", error);
    // Add to error lock to prevent hammering
    setErrorLock(userId);
    return getCachedParentInfo(userId); // Return cached data as fallback
  }
}

/**
 * Create new parent information
 */
export async function createParentInfo(user: any) {
  try {
    if (!user?.id || !user.user_metadata?.name) {
      console.error("Missing user data for creating parent record");
      return null;
    }
    
    // Check if a record already exists before creating
    const existingParent = await fetchParentInfoById(user.id);
    if (existingParent) {
      console.log("Parent record already exists, returning existing record");
      return existingParent;
    }
    
    console.log("Creating new parent record for user:", user.id);
    const newParent = {
      id: user.id,
      name: user.user_metadata.name as string,
      relationship: "Parent",
      email: user.email || "",
      emergency_contact: ""
    };
    
    const { error: insertError } = await supabase
      .from('parents')
      .insert([newParent]);
      
    if (insertError) {
      console.error("Error creating parent record:", insertError.message, insertError.details, insertError.hint);
      return null;
    }
    
    const parentInfo = {
      id: newParent.id,
      name: newParent.name,
      relationship: newParent.relationship,
      email: newParent.email,
      emergencyContact: newParent.emergency_contact,
    };
    
    // Update cache
    updateParentCache(user.id, parentInfo);
    
    // Clear any error locks
    clearParentCache(user.id);
    
    return parentInfo;
  } catch (error) {
    console.error("Error in createParentInfo:", error);
    return null;
  }
}

/**
 * Save parent information
 */
export async function saveParentInfo(info: Partial<ParentInfo> & { id: string }) {
  try {
    console.log("saveParentInfo called with data:", info);
    
    if (!info.id) {
      console.error("Cannot save parent info without an ID");
      return false;
    }
    
    // Check authentication state
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error("Error getting auth session:", authError.message);
      return false;
    }
    
    console.log("Current auth state during save operation:", 
      authData?.session ? "Authenticated as " + authData.session.user.id : "Not authenticated");
    
    if (!authData?.session) {
      console.error("User is not authenticated, cannot save parent info");
      return false;
    }
    
    // Verify if the authenticated user ID matches the parent ID or has admin rights
    if (authData.session.user.id !== info.id) {
      console.error("User ID mismatch - authenticated as:", authData.session.user.id, "but trying to update:", info.id);
      return false;
    }
    
    // Create the update object with only the fields that are provided
    const updateData: any = {};
    if (info.name !== undefined) updateData.name = info.name;
    if (info.relationship !== undefined) updateData.relationship = info.relationship;
    if (info.email !== undefined) updateData.email = info.email;
    if (info.emergencyContact !== undefined) updateData.emergency_contact = info.emergencyContact;
    if (info.additionalInfo !== undefined) updateData.additional_info = info.additionalInfo;
    
    // If no fields to update, return success
    if (Object.keys(updateData).length === 0) {
      console.log("No fields to update provided, returning success");
      return true;
    }
    
    console.log("Preparing update with data:", updateData);
    
    // Update the parent record using the DB structure column names
    const { data, error } = await supabase
      .from('parents')
      .update(updateData)
      .eq('id', info.id)
      .select();
      
    if (error) {
      console.error("Error saving parent info:", error.message, error.details, error.hint);
      return false;
    }
    
    console.log("Parent info saved successfully for:", info.id, "Response data:", data);
    
    // Update cache
    updateParentCache(info.id, info);
    
    return true;
  } catch (error) {
    console.error("Error in saveParentInfo:", error);
    return false;
  }
}

/**
 * Update specific fields of parent information
 */
export async function updateParentInfoFields(parentId: string, updatedFields: Partial<ParentInfo>) {
  try {
    console.log("Updating parent info fields for:", parentId);
    const update: any = {};
    if (updatedFields.name !== undefined) update.name = updatedFields.name;
    if (updatedFields.relationship !== undefined) update.relationship = updatedFields.relationship;
    if (updatedFields.email !== undefined) update.email = updatedFields.email;
    if (updatedFields.emergencyContact !== undefined) update.emergency_contact = updatedFields.emergencyContact;
    if (updatedFields.additionalInfo !== undefined) update.additional_info = updatedFields.additionalInfo;
    
    // Ensure we have fields to update
    if (Object.keys(update).length === 0) {
      console.warn("No fields to update for parent:", parentId);
      return true; // Return true as this isn't an error
    }
    
    const { data, error } = await supabase
      .from('parents')
      .update(update)
      .eq('id', parentId);
      
    if (error) {
      console.error("Error updating parent info:", error.message, error.details, error.hint);
      return false;
    }
    
    console.log("Parent info fields updated successfully. Response data:", data);
    
    // Update cache if it exists
    const cachedInfo = getCachedParentInfo(parentId);
    if (cachedInfo) {
      updateParentCache(parentId, { ...cachedInfo, ...updatedFields });
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateParentInfoFields:", error);
    return false;
  }
}
