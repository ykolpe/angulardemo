using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace uicap.ui.a2.web.Controllers
{
    /// <summary>
    /// Authorization Controller
    /// </summary>
    /// <seealso cref="Microsoft.AspNetCore.Mvc.Controller" />
    [Route("api/[controller]")]
	public class AuthController : Controller
	{
        /// <summary>
        /// The group name
        /// </summary>
        string groupName = null;

        /// <summary>
        /// Gets the name of the user.
        /// </summary>
        /// <returns></returns>
        [HttpGet("[action]")]
		public string GetUserName()
		{			
			string username = User.Identity.Name.Split('\\')[1];			
			//ViewBag.UserName = username;			
			return username;
		}

        /// <summary>
        /// Gets the groups.
        /// </summary>
        /// <returns></returns>
        [HttpGet("[action]")]
		public string[] GetGroups()
		{
			var groups = new List<string>();

			var wi = (WindowsIdentity)User.Identity;
			if (wi.Groups != null)
				foreach (var group in wi.Groups)
				{
					try
					{
						string groupName = null;
						groupName = group.Translate(typeof(NTAccount)).ToString();
						if (groupName.Contains('\\'))
						{
							groups.Add(groupName.Split('\\')[1]);
						}
						else
							groups.Add(groupName);
					}
					catch (IdentityNotMappedException)
					{
						// ignored
					}
				}
			groups.Add("ICAP Contracts");
			groups.Sort(); // optional
            //groups.Remove("ICAP Project Controls");
            return groups.ToArray();
		}
	}	
}
