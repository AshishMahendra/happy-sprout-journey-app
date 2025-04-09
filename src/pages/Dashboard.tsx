
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import Layout from "@/components/Layout";
import { CalendarDays, BookOpen, Award, TrendingUp, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const navigate = useNavigate();
  const { childProfiles, getCurrentChild, currentChildId, setCurrentChildId } = useUser();
  const currentChild = getCurrentChild();
  
  // Mock quotes for demo
  const motivationalQuotes = [
    "Believe you can and you're halfway there.",
    "You are braver than you believe, stronger than you seem, and smarter than you think.",
    "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    "It always seems impossible until it's done.",
    "You're off to great places! Today is your day! Your mountain is waiting, so get on your way!"
  ];
  
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  
  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4">
        {childProfiles.length === 0 ? (
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Welcome to Happy Sprout!</h1>
            <p className="text-gray-600 mb-8">Let's get started by creating a profile for your child</p>
            <Button 
              className="sprout-button"
              onClick={() => navigate("/create-profile")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Child Profile
            </Button>
          </div>
        ) : (
          <>
            {!currentChildId && childProfiles.length > 0 && (
              <div className="mb-8 sprout-card">
                <h2 className="text-xl font-bold mb-4">Select a Child Profile</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {childProfiles.map(profile => (
                    <div 
                      key={profile.id}
                      className="p-4 bg-white rounded-lg border-2 border-sprout-purple/20 hover:border-sprout-purple cursor-pointer transition-all hover:shadow-md"
                      onClick={() => setCurrentChildId(profile.id)}
                    >
                      <div className="text-3xl mb-2">👧👦</div>
                      <h3 className="font-bold text-lg">{profile.nickname}</h3>
                      <p className="text-sm text-gray-500">Age: {profile.age}</p>
                      <p className="text-sm text-gray-500">Grade: {profile.grade}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {currentChild && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {currentChild.nickname}!</h1>
                  <p className="text-gray-600">Let's continue growing your emotional skills today.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
                      <div className="h-4 w-4 rounded-full bg-sprout-orange text-white flex items-center justify-center">
                        <Award className="h-3 w-3" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{currentChild.streakCount} days</div>
                      <p className="text-xs text-muted-foreground">Keep the streak going!</p>
                      <Progress value={20} className="h-2 mt-3" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Experience Points</CardTitle>
                      <div className="h-4 w-4 rounded-full bg-sprout-green text-white flex items-center justify-center">
                        <TrendingUp className="h-3 w-3" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{currentChild.xpPoints} XP</div>
                      <p className="text-xs text-muted-foreground">Level 1 - Growing Seedling</p>
                      <Progress value={40} className="h-2 mt-3" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
                      <div className="h-4 w-4 rounded-full bg-sprout-purple text-white flex items-center justify-center">
                        <Award className="h-3 w-3" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{currentChild.badges.length}</div>
                      <p className="text-xs text-muted-foreground">Keep going to earn more!</p>
                      <div className="flex mt-3">
                        {currentChild.badges.length === 0 ? (
                          <div className="text-sm text-gray-500">No badges yet</div>
                        ) : (
                          currentChild.badges.map((badge, index) => (
                            <div key={index} className="mr-2">🏆</div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="md:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Activities for Today</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center p-3 bg-sprout-orange/10 rounded-lg">
                            <div className="mr-4 bg-sprout-orange text-white p-2 rounded-full">
                              <CalendarDays className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-medium">Daily Check-In</h3>
                              <p className="text-sm text-gray-600">Share how you're feeling today!</p>
                            </div>
                            <Button 
                              className="ml-auto sprout-button"
                              onClick={() => navigate("/daily-check-in")}
                            >
                              Start
                            </Button>
                          </div>
                          
                          <div className="flex items-center p-3 bg-sprout-purple/10 rounded-lg">
                            <div className="mr-4 bg-sprout-purple text-white p-2 rounded-full">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-medium">Journal Entry</h3>
                              <p className="text-sm text-gray-600">Write about your day and thoughts</p>
                            </div>
                            <Button 
                              className="ml-auto bg-sprout-purple text-white hover:bg-sprout-purple/90 rounded-full"
                              onClick={() => navigate("/journal")}
                            >
                              Start
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Inspiration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-gradient-to-br from-sprout-yellow/30 to-sprout-orange/30 rounded-lg">
                        <p className="italic text-gray-800">"{randomQuote}"</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
