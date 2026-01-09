using Microsoft.AspNetCore.SignalR;

namespace ApiMonitor.Hubs
{
    public class LogsHub : Hub
    {
        public async Task JoinLogGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }
    }
}